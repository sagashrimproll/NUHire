'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import NotesPage from "../components/note";
import { useProgress } from "../components/useProgress";
import Footer from "../components/footer";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import RatingSlider from "../components/ratingSlider";
import Popup from "../components/popup";
import axios from "axios";

// Define API_BASE_URL with a fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';

// Initialize socket only after API_BASE_URL is defined
const socket = io(API_BASE_URL);

interface User {
  id: string;
  group_id: string; 
  email: string;
}

interface Interview {
  id: number;
  resume_id: number;
  interview: string;
}

export default function Interview() {
  useProgress();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ headline: string; message: string } | null>(null);
  const pathname = usePathname();
  
  // Rating states
  const [overall, setOverall] = useState(5); 
  const [professionalPresence, setProfessionalPresence] = useState(5); 
  const [qualityOfAnswer, setQualityOfAnswer] = useState(5); 
  const [personality, setPersonality] = useState(5);
  
  // Video states
  const [videoIndex, setVideoIndex] = useState(0); 
  const [timeSpent, setTimeSpent] = useState(0);
  const [fadingEffect, setFadingEffect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [interviews, setInterviews] = useState<
    { resume_id: number; title: string; video_path: string }[]
  >([]);
  const [noShow, setNoShow] = useState(false);

  interface User {
    id: string;
    group_id: string;
    email: string;
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/user`, { 
          withCredentials: true 
        });
        
        if (response.status === 200) {
          setUser(response.data);
        } else {
          setError('Authentication failed. Please log in again.');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError('Failed to authenticate. Make sure the API server is running.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  // Update current page when user is loaded
  useEffect(() => {
    if (user && user.email) {
      // Emit socket events
      socket.emit("studentOnline", { studentId: user.email }); 
      socket.emit("studentPageChanged", { studentId: user.email, currentPage: pathname });
      
      // Update current page in database
      const updateCurrentPage = async () => {
        try {
          await axios.post(`${API_BASE_URL}/update-currentpage`, {
            page: 'interviewpage', 
            user_email: user.email
          });
        } catch (error) {
          console.error("Error updating current page:", error);
        }
      };
      
      updateCurrentPage(); 
    }
  }, [user, pathname]);

  // Fetch candidates data when user is loaded
  useEffect(() => {
    if (!user?.group_id) return;
    
    const fetchCandidates = async () => {
      try {
        // First get the resumes with checked = TRUE
        const resumeResponse = await axios.get(`${API_BASE_URL}/resume/group/${user.group_id}?class=${user.class}`);
        const allResumes = resumeResponse.data;
        
        // Filter to get only checked resumes
        const checkedResumes = allResumes.filter(resume => resume.checked === 1);
        
        if (!checkedResumes || checkedResumes.length === 0) {
          console.log("No checked resumes found");
          return;
        }
        
        // Fetch candidate data for each checked resume
        const candidatesData = await Promise.all(
          checkedResumes.map(async (resume) => {
            try {
              const candidateResponse = await axios.get(`${API_BASE_URL}/canidates/resume/${resume.resume_number}`);
              return candidateResponse.data;
            } catch (err) {
              console.error(`Error fetching candidate for resume ${resume.resume_number}:`, err);
              return null;
            }
          })
        );
        
        setInterviews(candidatesData.filter(Boolean));
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError('Failed to load interview data');
      }
    };
    
    fetchCandidates();
  }, [user]);
  
  // Listen for popup messages
  useEffect(() => {
    socket.on("receivePopup", ({ headline, message }) => {
      setPopup({ headline, message });
    });
    
    return () => {
      socket.off("receivePopup");
    };
  }, []);

  // Timer for tracking time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000); 
    
    return () => clearInterval(timer);
  }, []);

  // Get current video
  const currentVid = interviews[videoIndex];

  // Debug logging
  useEffect(() => {
    console.log("Interviews:", interviews);
    console.log("Video Index:", videoIndex);
    console.log("Current video:", currentVid);
  }, [interviews, videoIndex, currentVid]);

  // Move to next video with transition effect
  const nextVideo = () => { 
    if (videoIndex < interviews.length - 1) { 
      setFadingEffect(true); 
      setTimeout(() => {
        setVideoIndex(videoIndex + 1); 
        setTimeSpent(0); 
        setFadingEffect(false); 
      }, 500);
    } else {
      setFinished(true);
    }
  }
  
  // Rating change handlers
  const handleOverallSliderChange = (value: number) => {
    setOverall(value); 
  }
  
  const handleProfessionalPresenceSliderChange = (value: number) => {
    setProfessionalPresence(value); 
  }
  
  const handleQualityOfAnswerSliderChange = (value: number) => {
    setQualityOfAnswer(value); 
  }
  
  const handlePersonalitySliderChange = (value: number) => {
    setPersonality(value); 
  }
  
  // Reset all ratings
  const resetRatings = () => {
    setOverall(5); 
    setProfessionalPresence(5); 
    setQualityOfAnswer(5); 
    setPersonality(5); 
  }

  // Send interview ratings to backend
  const sendResponseToBackend = async (
    overall: number,
    professionalPresence: number,
    qualityOfAnswer: number,
    personality: number,
    timeSpent: number,
    candidate_id: number
  ) => {
    if (!user || !user.id || !user.group_id || !user.class) {
      console.error("Student ID or Group ID not found");
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/interview/vote`, {
        student_id: user.id,
        group_id: user.group_id,
        studentClass: user.class,
        question1: overall,
        question2: professionalPresence,
        question3: qualityOfAnswer,
        question4: personality,
        timespent: timeSpent,
        candidate_id: candidate_id
      });
      
      if (response.status !== 200) {
        console.error("Failed to submit response:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };
  
  // Handle submission of current interview
  const handleSubmit = async () => {
    if (!currentVid) {
      console.error("No current video selected");
      return;
    }
    
    await sendResponseToBackend(
      overall,
      professionalPresence,
      qualityOfAnswer,
      personality,
      timeSpent,
      currentVid.resume_id
    );

    if (videoIndex < interviews.length - 1) {
      nextVideo();
      resetRatings();
    } else {
      console.log("All interviews have been rated!");
      setFinished(true);
    }
  };
  
  // Complete interview process and move to next stage
  const completeInterview = () => {
    localStorage.setItem("progress", "makeOffer");
    window.location.href = '/makeOffer';
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sand">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <div className="w-16 h-16 border-t-4 border-navy border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sand">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-2">Please try refreshing the page or return to the dashboard.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4 bg-navyHeader text-white px-4 py-2 rounded hover:bg-navy transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sand">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p>Please log in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-navyHeader text-white px-4 py-2 rounded hover:bg-navy transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // No interviews state
  if (interviews.length === 0) {
    return (
      <div className="bg-sand font-rubik min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-6">Interview Stage</h1>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="font-medium">No interviews are currently available.</p>
              <p>You need to select candidates in the Resume Review Group stage first.</p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => window.location.href = "/res-review-group"}
                className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik"
              >
                ← Go to Resume Review Group
              </button>
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main content - interview page
  return (
    <div className="bg-sand font-rubik min-h-screen">
      <Navbar />
      <div className="flex items-right justify-end">
        <NotesPage />
      </div>
      <div className="flex justify-center items-center font-rubik text-navyHeader text-4xl font-bold mb-4">
        Interview Page
      </div>

      <div className="relative flex flex-col md:flex-row min-h-screen mt-4">
        {/* Evaluation panel */}
        <div className="md:w-1/3 bg-blue-50 shadow-lg p-4 mx-4 my-2 flex flex-col items-center justify-start rounded-lg">
          <h1 className="text-2xl text-navyHeader font-bold mb-4">
            Evaluation
          </h1>
          <h3 className="font-bol text-navy text-center">
            Please watch the interview and rate on a scale from 1 - 10
          </h3>
          <h3 className="font-bol text-navy text-center mb-4">
            Submit to note your responses and move to the next interview.
          </h3>

          {/* Rating sliders */}
          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Overall
            </h2>
            <RatingSlider onChange={handleOverallSliderChange} value={overall} />
          </div>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Professional Presence
            </h2>
            <RatingSlider onChange={handleProfessionalPresenceSliderChange} value={professionalPresence} />
          </div>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Quality of Answer
            </h2>
            <RatingSlider onChange={handleQualityOfAnswerSliderChange} value={qualityOfAnswer} />
          </div>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Personality & Creativeness
            </h2>
            <RatingSlider onChange={handlePersonalitySliderChange} value={personality} />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={finished}
            className={`px-4 py-2 rounded-lg shadow-md transition duration-300 font-rubik mt-6 ${
              finished
                ? "bg-blue-500 text-white opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-900"
            }`}
          >
            Submit Response
          </button>
          
          {/* Video progress indicator */}
          <div className="mt-6 text-sm text-gray-700">
            Video {videoIndex + 1} of {interviews.length}
          </div>
        </div>

        {/* Completion notification */}
        {finished && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-springWater p-8 w-200 rounded-md shadow-lg z-50 font-bold font-rubik text-navyHeader">
            <p className="mb-4">All Interviews have been rated! You can move onto the next stage!</p>
            <button
              onClick={completeInterview}
              className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik"
            >
              Continue to Next Stage
            </button>
          </div>
        )}

        {/* Video display */}
        <div className={`md:w-2/3 flex flex-col items-center justify-center p-4 md:p-8 ${fadingEffect ? 'opacity-50 transition-opacity duration-500' : 'opacity-100 transition-opacity duration-500'}`}>
          <h1 className="text-xl font-rubik font-bold mb-4 text-center">
            {noShow ? "Candidate No-Show" : `Candidate Interview ${videoIndex + 1}`}
          </h1>
          <div className="w-full max-w-4xl aspect-video border-4 border-navyHeader mb-5 rounded-lg shadow-lg mx-auto">
            {noShow ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl font-bold">
                  This candidate did not show up.
                </p>
              </div>
            ) : currentVid ? (
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src={currentVid.interview}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <p className="text-gray-500">Loading Interview Video...</p>
              </div>
            )}
          </div>
          
          {/* Timer display */}
          <div className="text-sm text-gray-500">
            Time spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Popup component */}
        {popup && (
          <Popup
            headline={popup.headline}
            message={popup.message}
            onDismiss={() => setPopup(null)}
          />
        )}
      </div>

      {/* Navigation footer */}
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
            className={`px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md transition duration-300 font-rubik
            ${
              !finished
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-navy"
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