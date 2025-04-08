'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import NotesPage from "../components/note";
import { useProgress } from "../components/useProgress";
import Footer from "../components/footer";
import router from "next/router";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import RatingSlider from "../components/ratingSlider";
import Popup from "../components/popup";

const socket = io("http://localhost:5001");

export default function Interview() {
  useProgress();
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{ headline: string; message: string } | null>(null);
  const pathname = usePathname();
  const [overall, setOverall] = useState(5); 
  const [professionalPresence, setProfessionalPresence] = useState(5); 
  const [qualityOfAnswer, setQualityOfAnswer] = useState(5); 
  const [personality, setPersonality] = useState(5);
  const [videoIndex, setVideoIndex] = useState(0); 
  const [timeSpent, setTimeSpent] = useState(0);
  const [fadingEffect, setFadingEffect] = useState(false); 
  const [finished, setFinished] = useState(false);

  interface User {
    id: string;
    group_id: string; 
    email: string;
  }

  const vidList = [
    "https://www.youtube.com/embed/srw4r3htm4U",
    "https://www.youtube.com/embed/sjTxmq68RXU",
    "https://www.youtube.com/embed/6bJTEZnTT5A",
    "https://www.youtube.com/embed/es7XtrloDIQ",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000); 
    return () => clearInterval(timer);
  }, []);
  
  const handleOverallSliderChange = (value: number) => {
    console.log("Overall Slider value changed to: ", value);
    setOverall(value); 
  }
  
  const handleProfessionalPresenceSliderChange = (value: number) => {
    console.log("Prof. Presence Slider value changed to: ", value);
    setProfessionalPresence(value); 
  }
  
  const handleQualityOfAnswerSliderChange = (value: number) => {
    console.log("Quality of Answer Slider value changed to: ", value);
    setQualityOfAnswer(value); 
  }
  
  const handlePersonalitySliderChange = (value: number) => {
    console.log("Personality and Creativity Slider changed to: ", value);
    setPersonality(value); 
  }
  
  const resetRatings = () => {
    setOverall(5); 
    setProfessionalPresence(5); 
    setQualityOfAnswer(5); 
    setPersonality(5); 
  }

  const currentVid = vidList[videoIndex];
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
        const userData = await response.json();
        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);


   useEffect(() => {
      if (user && user.email) {
        socket.emit("studentOnline", { studentId: user.email }); 
  
        socket.emit("studentPageChanged", { studentId: user.email, currentPage: pathname });
  
        const updateCurrentPage = async () => {
          try {
            await fetch("http://localhost:5001/update-currentpage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ page: 'interviewpage', user_email: user.email }),
            });
          } catch (error) {
            console.error("Error updating current page:", error);
          }
        };
  
        updateCurrentPage(); 
      }
    }, [user, pathname]);
  


      useEffect(() => {
        socket.on("receivePopup", ({ headline, message }) => {
          setPopup({ headline, message });
        });
        return () => {
          socket.off("receivePopup");
        };
      }, []);


      const nextVideo = () => { 
        if (videoIndex < vidList.length - 1){ 
          setFadingEffect(true); 
          setTimeout(() => {
            setVideoIndex(videoIndex + 1); 
            setTimeSpent(0); 
            setFadingEffect(false); 
            console.log(videoIndex);
          }, 500);
        }
      }


      
      
      const sendResponseToBackend = async (
        overall: number,
        professionalPresence: number,
        qualityOfAnswer: number,
        personality: number,
        timeSpent: number,
        candidate_id: number
      ) => {
        if (!user || !user.id || !user.group_id) {
          console.error("Student ID or Group ID not found");
          return;
        }
        
        try {
          const response = await fetch("http://localhost:5001/interview/vote", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_id: user.id,
              group_id: user.group_id,
              question1: overall,
              question2: professionalPresence,
              question3: qualityOfAnswer,
              question4: personality,
              timespent: timeSpent,
              candidate_id: candidate_id
            }),
          });
          if (!response.ok) {
            console.error("Failed to submit response:", response.statusText);
          }
        } catch (error) {
          console.error("Error submitting response:", error);
        }
      };
      
      const handleSubmit = async () => {
        await sendResponseToBackend(
          overall,
          professionalPresence,
          qualityOfAnswer,
          personality,
          timeSpent,
          videoIndex + 1
        );

        if (videoIndex < vidList.length - 1) {
          nextVideo();
          resetRatings();
        } else {
          console.log("All interviews have been are rated!");
          setFinished(true);
        }
      };
      
      const completeInterview = () => {
        localStorage.setItem("progress", "makeOffer");
        window.location.href = '/makeOffer ';
      }


  if (loading) {
    <div> Loading ...</div>
  }
  if(!user) { 
    <div> User Error</div>
  }


  

  return (
    <div className="bg-sand font-rubik">
      <Navbar />
      <div className="flex items-right justify-end">
        <NotesPage />
      </div>
      <div className="flex justify-center items-center font-rubik text-navyHeader text-4xl font-bold mb-4">
        Interview Page
      </div>

      <div className="relative flex flex-col md:flex-row min-h-screen mt-4">
        
        <div className="md:w-1/3 bg-blue-50 shadow-lg p-4 mx-4 my-2 flex flex-col items-center justify-start rounded-lg">
          <h1 className="text-2xl text-navyHeader font-bold mb-4">Evaluation</h1>
          <h3 className="font-bol text-navy text-center"> Please watch the interview and rate on a scale from 1 - 10</h3>
          <h3 className="font-bol text-navy text-center mb-4"> Submit to note your responses and move to the next interview.</h3>

          
          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">Overall</h2>
            <RatingSlider onChange={handleOverallSliderChange} />
          </div>

          
          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">Professional Presence</h2>
            <RatingSlider onChange={handleProfessionalPresenceSliderChange} />
          </div>

          
          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">Quality of Answer</h2>
            <RatingSlider onChange={handleQualityOfAnswerSliderChange} />
          </div>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">Personality & Creativeness</h2>
            <RatingSlider onChange={handlePersonalitySliderChange} />
          </div>

          <button //submitting this response will send the answer to all the backend to db with saving the votes for that resume
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-900 mt-6 transition duration-300 font-rubik"> 
          Submit Response
          </button>
        </div>

        {finished && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-springWater p-8 w-200 rounded-md shadow-lg z-50 font-bold font-rubik text-navyHeader">
          All Interviews have been rated! You can move onto the next stage!
        </div>
      )}

        <div className="md:w-2/3 flex flex-col items-center justify-center p-4 md:p-8">
          <h1 className="text-xl font-rubik font-bold mb-4 text-center">
            Place Holder interview video
          </h1>
          <div className="w-full max-w-4xl aspect-video border-4 border-navyHeader mb-5 rounded-lg shadow-lg mx-auto">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src={currentVid}
              title="Job Interview Simulation and Training - Mock Interview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
            
          </div>
        </div>

        {popup && (
          <Popup
            headline={popup.headline}
            message={popup.message}
            onDismiss={() => setPopup(null)}
          />
        )}
      </div>


      <footer>
        <div className="flex justify-between ml-4 mt-4 mb-4 mr-4">
          <button
            onClick={() => (window.location.href = "/res-review-group")}
            className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik"
          >
            ← Back: Resume Review Group
          </button>
          <button
            onClick={completeInterview}
            className={`px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik
            ${
              !finished
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-blue-400"
            }`}
            disabled={!finished}
          >
            Next: Make Offer page →
          </button>
        </div>
      </footer>
      <Footer />
    </div>
  );
}
