
// src/hooks/useOnlineStatus.js

// 1. Import necessary React features
// We need 'useState' to manage state (data that changes over time) within our component/hook.
// We need 'useEffect' to perform "side effects" like adding/removing event listeners.
import { useState, useEffect } from 'react';

/**
 * 2. JSDoc Comment: Explains what this custom hook does.
 * This is good practice for documentation, especially for reusable pieces of code.
 *
 * Custom React Hook to track the online/offline status of the browser.
 * React Hooks are special JavaScript functions that let you "hook into" React features
 * like state and lifecycle methods in functional components. Custom hooks are functions
 * that start with 'use' and allow you to reuse stateful logic across different components.
 *
 * @returns {boolean} - True if the browser is online, false if offline.
 */
const useOnlineStatus = () => { // 3. Define our custom Hook: 'useOnlineStatus'

  // 4. State Management with 'useState'
  // 'isOnline' is our state variable. It will hold 'true' if we're online, 'false' if offline.
  // 'setIsOnline' is the function we use to UPDATE the 'isOnline' state.
  // 'navigator.onLine' is a built-in browser property that tells us the current online status.
  // We initialize 'isOnline' with the browser's *current* online status when the hook first runs.
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 5. Side Effect Management with 'useEffect'
  // 'useEffect' is a React Hook that lets you synchronize a component with an external system.
  // Here, the "external system" is the browser's network status.
  useEffect(() => {
    // 6. Define Event Handlers
    // These are simple functions that will be called when the 'online' or 'offline' events fire.
    // They just update our 'isOnline' state using 'setIsOnline()'.
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // 7. Add Event Listeners when the component (that uses this hook) "mounts" (appears on screen)
    // 'window.addEventListener' is a standard browser API.
    // It tells the browser: "When the 'online' event happens, call 'handleOnline'."
    // And: "When the 'offline' event happens, call 'handleOffline'."
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 8. Clean up Function: Runs when the component "unmounts" (is removed from the screen)
    // This is super important to prevent memory leaks and unexpected behavior!
    // We remove the event listeners we added. If we didn't, these listeners would
    // stay active even after the component is gone, potentially causing errors
    // or listening unnecessarily.
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // 9. Dependency Array: '[]' (empty array)

  // This empty array means the 'useEffect' will run its setup function (the part where we add listeners)
  // ONLY ONCE when the component first mounts.
  // It also means the cleanup function will run ONLY ONCE when the component unmounts.
  // This is exactly what we want for setting up global event listeners like these.

  // 10. Return the current online status
  // Our custom hook simply returns the 'isOnline' state.
  // Any component that uses 'useOnlineStatus()' will get this boolean value,
  // and it will automatically re-render whenever 'isOnline' changes.
  return isOnline;
}

// 11. Export the hook
// 'export default' makes our 'useOnlineStatus' hook available to be imported
// and used in other React components or files throughout our project.
export default useOnlineStatus;








