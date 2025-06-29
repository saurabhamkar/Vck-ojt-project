
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import "./styles/pages.css";
import Header from './componets/Headers/Header'
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import CoursesPage from "./pages/CoursesPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import NotFoundPage from "./pages/NotFoundPage";
import DeveloperInfoPopup from "./componets/DeveloperInfo/DeveloperInfoPopup";
import { useState } from "react";
import ChatbotComponent from "./componets/Chatbot/ChatbotComponents";
import Footer from "./componets/Footer/Footer";





const App = () =>{

  const [showPopup, setShowPopup] = useState(true);
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  return(

    <>

    <div>
        {/* Your main application content */}
        <DeveloperInfoPopup
          show={showPopup}
          onClose={handleClosePopup}
          studentName="Sourabh Yashwant Aamakar"
          studentPhotoUrl="/images/sourabh.jpg" // Path to their photo
          uniqueMessage="Learned so much during this OJT! This app showcases my independent coding and deployment skills"
      />
        </div>
    <Router>
      <div className="main-layout">

<Header/>
      
  <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            
           

        </Routes>
      < ChatbotComponent/> 

    

      </div>

      <Footer/>

      


    </Router>
    </>
  )
}
export default App;

