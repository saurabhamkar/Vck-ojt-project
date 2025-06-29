// src/components/Chatbot/ChatbotComponent.jsx

// 1. Import necessary React Hooks and external utilities
//    - useState: To manage state (data that changes and causes re-renders) within our component.
//    - useEffect: To perform side effects (like data fetching, setting up event listeners,
//      or interacting with the DOM) after a component renders.
//    - useRef: To get a direct reference to a DOM element (like our chat messages container)
//      which is useful for tasks like scrolling.
import React, { useState, useEffect, useRef } from "react";

// 2. Import AI-related functions
//    - getEmbeddings: Our function to convert text into numerical vectors (embeddings) using the Gemini AI.
//    - cosineSimilarity: Our function to measure how similar two text embeddings are.
import { getEmbeddings, cosineSimilarity } from "../../utils/aiService";

// 3. Import constants
//    - SIMILARITY_THRESHOLD: The minimum score needed for a user query to match a known intent.
import { SIMILARITY_THRESHOLD } from "../../utils/constants";

// 4. Import component-specific CSS
//    This file will contain all the styling rules for our chatbot's appearance.
import "./Chatbot.css";

// 5. Import our custom hook
//    - useOnlineStatus: A custom hook we created earlier to check the user's internet connection.
import useOnlineStatus from "../../hooks/useOnlineStatus";

// 6. Import the knowledge base data
//    - KNOWLEDGE_BASE_DATA: This is the JSON object we defined earlier, containing our
//      chatbot's predefined responses and example queries for different intents (like "greeting", "courses").
import KNOWLEDGE_BASE_DATA from "../../data/knowledgeBase.json";

// 7. Define the ChatbotComponent functional component
//    This is the main React component that will render our interactive chatbot.
const ChatbotComponent = () => {
  // --- State Variables ---
  // State variables are pieces of data that, when changed, will cause React to re-render
  // the component and update the user interface.

  // 8. messages: Stores the list of chat messages (both user and bot).
  //    - Each message is an object with 'text' (the message content) and 'sender' ('user' or 'bot').
  //    - It's initialized with the bot's greeting message.
  const [messages, setMessages] = useState([
    { text: KNOWLEDGE_BASE_DATA.greeting.response, sender: "bot" },
  ]);

  // 9. inputValue: Stores the text currently being typed by the user in the input field.
  const [inputValue, setInputValue] = useState("");

  // 10. loading: A boolean flag to indicate if the bot is currently processing a response (e.g., fetching embeddings).
  //     Used to show a "Typing..." indicator and disable the input field.
  const [loading, setLoading] = useState(false);

  // 11. chatMessagesRef: A ref (reference) to the div that contains all the chat messages.
  //     We'll use this to programmatically scroll to the bottom when new messages arrive.
  const chatMessagesRef = useRef(null);

  // 12. preparedKnowledgeBase: Stores a version of our KNOWLEDGE_BASE_DATA where
  //     the 'exampleEmbeddings' have been pre-calculated. This avoids re-calculating
  //     them for every user message.
  const [preparedKnowledgeBase, setPreparedKnowledgeBase] =
    useState(KNOWLEDGE_BASE_DATA);

  // 13. isKnowledgeBaseLoading: A flag to indicate if the embeddings for the knowledge base
  //     are still being generated (which happens when the component first loads).
  const [isKnowledgeBaseLoading, setIsKnowledgeBaseLoading] = useState(true);

  // 14. isOnline: Uses our custom hook to track the user's online/offline status.
  const isOnline = useOnlineStatus();

  // 15. isChatOpen: A boolean flag to control the visibility of the chatbot window.
  //     Starts as 'false' (closed).
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- Effects (useEffect Hooks) ---

  // 16. useEffect for Preparing the Knowledge Base (Runs once on component mount)
  useEffect(() => {
    // 17. Define an async function to perform the preparation
    const prepareKB = async () => {
      // 18. Create a deep copy of the original knowledge base data.
      //    This is important because we're going to ADD new data (embeddings) to it,
      //    and we don't want to modify the original imported KNOWLEDGE_BASE_DATA directly.
      const newKB = JSON.parse(JSON.stringify(KNOWLEDGE_BASE_DATA));

      // 19. Loop through each 'intent' (like "greeting", "courses") in our knowledge base.
      for (const intent in newKB) {
        // 20. Check if the current intent has 'examples' and if there are any examples provided.
        if (newKB[intent].examples && newKB[intent].examples.length > 0) {
          // 21. Get embeddings for all example phrases for this intent.
          //    - newKB[intent].examples.map((example) => getEmbeddings(example)):
          //      For each example phrase (e.g., "hi", "hello"), call 'getEmbeddings'
          //      to get its numerical representation. This returns an array of Promises.
          //    - Promise.all(...): Waits for ALL these embedding requests to finish
          //      before proceeding. This is efficient as they run in parallel.
          //    - embeddings are vectors that help machines understand meanings: This inline comment
          //      reiterates the core concept of embeddings.
          const embeddings = await Promise.all(
            newKB[intent].examples.map((example) => getEmbeddings(example))
          );
          // 22. Store the calculated embeddings for this intent.
          //    We add a new property 'exampleEmbeddings' to our knowledge base object.
          newKB[intent].exampleEmbeddings = embeddings;
        }
      }
      // 23. Update the state with the newly prepared knowledge base (with embeddings).
      setPreparedKnowledgeBase(newKB);
      // 24. Set loading flag to false, indicating knowledge base is ready.
      setIsKnowledgeBaseLoading(false);
    };
    // 25. Call the preparation function when the component mounts.
    prepareKB();
  }, []); // 26. Empty dependency array `[]`: This ensures this `useEffect` runs only once,
  //     when the component first loads (mounts), and never again. Perfect for initial setup.

  // 27. useEffect for Auto-Scrolling Chat Messages (Runs when `messages` change)
  useEffect(() => {
    // 28. Check if the chat messages container element exists (i.e., if the ref is connected).
    if (chatMessagesRef.current) {
      // 29. Scroll to the very bottom of the chat box.
      chatMessagesRef.current.scrollTo({
        // Scrools the chat container to a specific position
        top: chatMessagesRef.current.scrollHeight, // Calculates the total scrollable height of the chat box.
        // Scrolls to very bottom of the chat box, so the latest message is visible
        behavior: "smooth", // Makes the scrolling animated and smooth.
      });
    }
  }, [messages]); // 30. Dependency array `[messages]`: This `useEffect` will re-run
  //     every time the `messages` state array is updated (i.e., a new message is added).

  // --- Core Chatbot Logic Functions ---

  // 31. getAIResponse: Determines the chatbot's response based on the user's message.
  const getAIResponse = async (userMessageText) => {
    // 32. Set loading state to true while processing the AI response.
    setLoading(true);

    // 33. Check if offline: If no internet, return an appropriate message.
    if (!isOnline) {
      setLoading(false); // Stop loading animation
      return "It seems you're offline. Please check your internet connection.";
    }

    // 34. Check if knowledge base is still loading: If not ready, ask user to wait.
    if (isKnowledgeBaseLoading) {
      setLoading(false); // Stop loading animation
      return "Please wait, I'm still getting ready...";
    }

    try {
      // 35. Get embedding for the user's message.
      //    - userEmbedding: This will be the numerical vector for what the user typed.
      const userEmbedding = await getEmbeddings(userMessageText); // we recieve vectors

      // 36. Initialize variables to find the best matching intent.
      let bestMatch = { intent: "default", score: 0 }; // Start with 'default' and a score of 0.

      // 37. Loop through each intent in the prepared knowledge base (except 'default').
      for (const intent in preparedKnowledgeBase) {
        if (intent === "default") continue; // Skip the 'default' intent for matching.

        const intentEmbeddings =
          preparedKnowledgeBase[intent].exampleEmbeddings;
        // 38. Skip intents that don't have example embeddings (shouldn't happen if `prepareKB` worked).
        if (intentEmbeddings.length === 0) continue;

        // 39. Compare user's message embedding with each example embedding for the current intent.
        for (const exampleEmbedding of intentEmbeddings) {
          // 40. Calculate cosine similarity score between user's message and the example.
          const score = cosineSimilarity(userEmbedding, exampleEmbedding);
          // 41. If this score is better than our current best match, update `bestMatch`.
          if (score > bestMatch.score) {
            bestMatch = { intent: intent, score: score };
          }
        }
      }

      // 42. Log the best matching intent and its score to the browser console for debugging.
      console.log(
        `Best matching intent: ${bestMatch.intent} with score: ${bestMatch.score}`
      );

      // 43. Decide on the response based on the best match's score.
      //    If the best match's score is greater than or equal to our SIMILARITY_THRESHOLD,
      //    return the corresponding response from the knowledge base.
      if (bestMatch.score >= SIMILARITY_THRESHOLD) {
        return preparedKnowledgeBase[bestMatch.intent].response;
      } else {
        // 44. If no good match is found, return the default fallback response.
        return preparedKnowledgeBase.default.response;
      }
    } catch (error) {
      // 45. Catch any errors during the AI response process (e.g., API issues).
      console.error("Error fetching AI response:", error); // Log the error to the console.

      // 46. Provide specific error messages for common API errors.
      if (error.message.includes("429")) {
        return "I'm experiencing high traffic right now. Please try again in a moment.";
      }
      if (error.message.includes("403") || error.message.includes("401")) {
        return "There's an issue with my internal setup (API key). Please inform the administrator.";
      }
      // 47. For other errors, fall back to the default response.
      return preparedKnowledgeBase.default.response;
    } finally {
      // 48. This block runs regardless of whether an error occurred or not.
      //    Ensures that the loading state is always set to false when the process finishes.
      setLoading(false);
    }
  };

  // 49. handleSendMessage: Called when the user clicks "Send" or presses Enter.
  const handleSendMessage = async () => {
    // 50. Don't send empty messages.
    if (inputValue.trim() === "") return;

    const userMessageText = inputValue;
    // 51. Create a new message object for the user's input.
    const newUserMessage = { text: userMessageText, sender: "user" };

    // 52. Add the user's message to the chat display.
    //    We use a functional update (prevMessages => ...) to ensure we're working
    //    with the latest state, which is important for arrays.
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    // 53. Clear the input field after sending.
    setInputValue("");

    // 54. Display immediate feedback if offline.
    if (!isOnline) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "You appear to be offline. Please check your internet connection.",
          sender: "bot",
        },
      ]);
      return; // Stop execution here if offline
    }

    // 55. Display immediate feedback if knowledge base is still loading.
    if (isKnowledgeBaseLoading) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Please wait a moment, I'm initializing my knowledge...",
          sender: "bot",
        },
      ]);
      return; // Stop execution here if KB is loading
    }

    // 56. Get the AI's response asynchronously.
    const aiResponseText = await getAIResponse(userMessageText);
    // 57. Create a new message object for the bot's response.
    const botResponse = { text: aiResponseText, sender: "bot" };
    // 58. Add the bot's response to the chat display.
    setMessages((prevMessages) => [...prevMessages, botResponse]);
  };

  // 59. handleInputChange: Updates the `inputValue` state as the user types.
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // 60. handleKeyPress: Handles pressing the Enter key to send a message.
  const handleKeyPress = (event) => {
    // 61. Check if the pressed key is 'Enter' and if the bot is not currently loading.
    if (event.key === "Enter" && !loading) {
      handleSendMessage(); // Call the send message function.
    }
  };

  // 62. toggleChat: Toggles the `isChatOpen` state to open/close the chatbot window.
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev); // Toggles the boolean value (true to false, false to true).
  };

  // --- Component Rendering (JSX) ---
  return (
    // 63. Main container for the chatbot application.
    <div className="chatbot-container">
      {" "}
      {/* This was the main app-container, now specific to Chatbot */}
      {/* 64. Chatbot Open Button (Visible only when chat is closed) */}
      {!isChatOpen && ( // Only render this button if `isChatOpen` is false.
        <button className="chatbot-open-button" onClick={toggleChat}>
          {/* 65. Image for the chat open button */}
          <img
            src="/images/operator.png" // Path to the chat icon image. Assumes it's in the /public/images folder.
            alt="Chat Icon"
            style={{ width: "100px", height: "auto" }} // Inline styles for image size.
          />
        </button>
      )}
      {/* 66. Chatbot Window (Conditionally rendered/styled based on `isChatOpen`) */}
      <div className={`chatbot-window ${isChatOpen ? "open" : "closed"}`}>
        {/* 67. Render chat content only if the chat window is open. */}
        {isChatOpen && (
          <>
            {" "}
            {/* React Fragment: Allows us to return multiple elements without adding an extra div to the DOM. */}
            {/* 68. Chatbot Header */}
            <div className="chatbot-header">
              <span role="img" aria-label="Chatbot icon">
                🤖
              </span>
              <h2>Educational Chatbot</h2>
              {/* 69. Chatbot Close Button */}
              <button className="chatbot-close-button" onClick={toggleChat}>
                ❌
              </button>
            </div>
            {/* 70. Initial Loading Indicator for Knowledge Base */}
            {isKnowledgeBaseLoading && ( // Only show this if knowledge base is still loading.
              <div className="initial-loading-container">
                <div className="spinner"></div>{" "}
                {/* CSS will make this a spinning animation. */}
                <p className="initial-loading-message">
                  Initializing knowledge base... Please wait.
                </p>
              </div>
            )}
            {/* 71. Offline Message */}
            {!isOnline && ( // Only show this if the user is offline.
              <p className="chatbot-message offline-message">
                🚫: You are currently offline. Please check your internet
                connection.
              </p>
            )}
            {/* 72. Chat Messages Display Area */}
            <div className="chatbot-messages" ref={chatMessagesRef}>
              {/* 73. Map through the 'messages' state to display each message. */}
              {messages.map((message, index) => (
                // 74. Each message row with dynamic class based on sender.
                <div key={index} className={`message-row ${message.sender}`}>
                  {/* 75. Bot Avatar (Only for bot messages) */}
                  {message.sender === "bot" && (
                    <div className="avatar bot-avatar">🤖</div>
                  )}
                  {/* 76. Message Text */}
                  <p className={`${message.sender}-message`}>{message.text}</p>
                  {/* 77. User Avatar (Only for user messages) */}
                  {message.sender === "user" && (
                    <div className="avatar user-avatar">👤</div>
                  )}
                </div>
              ))}
              {/* 78. Loading Indicator (Typing...) for AI Response */}
              {loading && ( // Only show "Typing..." if `loading` state is true.
                <div className="message-row bot">
                  <div className="avatar bot-avatar">🤖</div>
                  <p className="bot-message loading-indicator">Typing...</p>
                </div>
              )}
            </div>
            {/* 79. Chat Input Area */}
            <div className="chat-input-area">
              {/* 80. Message Input Field */}
              <input
                type="text"
                // 81. Dynamic placeholder text based on loading/offline status.
                placeholder={
                  loading || isKnowledgeBaseLoading || !isOnline
                    ? "Waiting..."
                    : "Type your message..."
                }
                className="message-input"
                value={inputValue} // Controlled component: input value is tied to state.
                onChange={handleInputChange} // Update state when input changes.
                onKeyDown={handleKeyPress} // Handle Enter key press.
                // 82. Disable input if loading, KB loading, or offline.
                disabled={loading || isKnowledgeBaseLoading || !isOnline}
              />
              {/* 83. Send Button */}
              <button
                className="send-button"
                onClick={handleSendMessage} // Send message on click.
                // 84. Disable button if loading, KB loading, or offline.
                disabled={loading || isKnowledgeBaseLoading || !isOnline}
              >
                {/* 85. Change button text based on loading state. */}
                {loading ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 86. Export the component for use in other parts of the application.
export default ChatbotComponent;
