'use client';
import React, { useEffect, useState, useRef } from "react";
import { useProgress } from "../components/useProgress";
import Navbar from "../components/navbar";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css"
import Notes from "../components/note";
import { Document, Page, pdfjs } from "react-pdf";
import NotesPage from "../components/note";
import Footer from "../components/footer";
import router from "next/router";


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


export default function ResumesPage() {
  useProgress();

  const resumesList = [
    "/test-resumes/sample1.pdf",
    "/test-resumes/sample2.pdf",
    "/test-resumes/sample3.pdf",
    "/test-resumes/sample4.pdf",
    "/test-resumes/sample5.pdf",
    "/test-resumes/sample6.pdf",
    "/test-resumes/sample7.pdf",
    "/test-resumes/sample8.pdf",
    "/test-resumes/sample9.pdf",
    "/test-resumes/sample10.pdf"
];

  const[resumes, setResumes] = useState(0);
  const[accepted, setAccepted] = useState(0);
  const[rejected, setRejected] = useState(0);
  const[noResponse, setNoResponse] = useState(0);
  const[timeRemaining, setTimeRemaining] = useState(30);
  const[currentResumeIndex, setCurrentResumeIndex] = useState(0);
  const [fadingEffect, setFadingEffect] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
 
  interface User {
    email: string;
}
const [user, setUser] = useState<User | null>(null);


  const totalDecisions = accepted + rejected + noResponse;
  const maxDecisions = totalDecisions >= 10;

  const resumeRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
          const userData = await response.json();
  
          if (response.ok) {
            setUser(userData);
          } else {
            setUser(null);
            router.push("/login"); 
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          router.push("/login");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, [router]);
  
    useEffect(() => {
      if (user && user.email) {
        const updateCurrentPage = async () => {
          try {
            const response = await fetch("http://localhost:5001/update-currentpage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ page: 'resumepage', user_email: user.email }),
            });
  
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Failed to update current page:", errorData.error);
            }
          } catch (error) {
            console.error("Error updating current page:", error);
          }
        };
  
        updateCurrentPage();
      }
    }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }
    , 1000);

    return () => clearInterval(timer);
  },  [currentResumeIndex]);

  const studentId = 1; 

  const sendVoteToBackend = async (vote: "yes" | "no" | "unanswered") => {
    
    if(!studentId) {
      console.error("Student ID not found");
      return;
    }
    
    try { 
      const response = await fetch("http://localhost:5001/resume/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          timespent: timeSpent,
          resume_number: currentResumeIndex + 1,
          vote: vote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error("Failed to save vote");
    }
    console.log("Vote saved successfully");
    } catch (error) {
      console.error("Error sending vote to backend:", error);
    }
  };

  const nextResume = () => { 
    if (currentResumeIndex < resumesList.length - 1){
      setFadingEffect(true);
      setTimeout(() => {
      setCurrentResumeIndex(currentResumeIndex + 1);
      setTimeRemaining(30);
      setTimeSpent(0); 
      setFadingEffect(false);

      if (resumeRef.current) {
        resumeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
      }, 500);
    }
  }

  useEffect(() => {
    if (timeRemaining > 0 && !maxDecisions) {
        const timer = setInterval(() => {
            setTimeRemaining(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !maxDecisions) {
      handleNoResponse();
    }
}, [timeRemaining]);

      // Handlers for button clicks
      const handleAccept = () => {
        if(maxDecisions) return;
        sendVoteToBackend("yes");
        setAccepted(prev => prev + 1);
        setResumes(prev => prev + 1);
        nextResume(); 
    };

    const handleReject = () => {
      if(maxDecisions) return;
        sendVoteToBackend("no");
        setRejected(prev => prev + 1);
        setResumes(prev => prev + 1);
        nextResume();
    };

    const handleNoResponse = () => {
      if(maxDecisions) return; 
      sendVoteToBackend("unanswered");
      setNoResponse(prev => prev + 1);
        nextResume();
    };

  const completeResumes = () => {
    localStorage.setItem("progress", "res-review-group");
    window.location.href = '/res-review-group';
  }



    return (
      <div>
        <Navbar />

        <div className="flex items-right justify-end">
          <NotesPage />
        </div>

        <div className="flex justify-center items-center font-rubik text-navyHeader text-3xl font-bold mb-3">
          <h1>Resume Review Part 1</h1>
        </div>

        <div className="flex flex-col items-center font-rubik text-navyHeader text-center space-y-5 mb-6">
          <h3>
            Review the resume and decide whether to accept, reject, or mark as
            no-response.
          </h3>
          <h3> You may accept as many as you like out of the 10. </h3>
          <h3>
            But you are prompted to go back and select only 4 to move onto the
            second stage the review process
          </h3>
          <h3>
            Don't worry if you rejected or accepted a resume you agree/disagree
            with. This is why it's done in groups.
          </h3>
        </div>

        <div className="flex justify-between w-full p-6">
          <div className="flex flex-col gap-4">
            <div className="bg-navy shadow-lg rounded-lg p-6 text-sand text-lg text-center sticky top-0">
              <h2 className="text-lg">Time Remaining:</h2>
              <h2 className="text-3xl">{timeRemaining} sec</h2>
            </div>

            <div className="bg-navy shadow-lg rounded-lg p-6 text-sand text-lg">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-left">Resume</span>
                <span className="text-right">
                  {currentResumeIndex + 1} / {resumesList.length}
                </span>
                <span className="text-left">Accepted</span>
                <span className="text-right">{accepted} / 10</span>
                <span className="text-left">Rejected</span>
                <span className="text-right">{rejected} / 10</span>
                <span className="text-left">No-response</span>
                <span className="text-right">{noResponse} / 10</span>
              </div>
            </div>

            <div className="flex items-center justify-center text-lg space-x-4 mt-4 sticky top-0">
              <button
                className="bg-[#a2384f] text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-red-600 hover:scale-105 transition duration-300"
                onClick={handleReject}
                disabled={resumes > 10}
              >
                Reject
              </button>

              <button
                className="bg-gray-500 text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105 transition duration-300"
                onClick={handleNoResponse}
                disabled={resumes > 10}
              >
                Skip
              </button>

              <button
                className="bg-[#367b62] text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-green-600 hover:scale-105 transition duration-300"
                onClick={handleAccept}
                disabled={resumes > 10}
              >
                Accept
              </button>
            </div>
          </div>

          <div className="flex justify-center items-start w-4/5 h-screen overflow-auto bg-transparent">
            <div
              className={`display-resumes ${
                fadingEffect ? "fade-out" : "fade-in"
              } 
              shadow-lg rounded-lg bg-white p-4`}
              ref={resumeRef}
              style={{
                maxWidth: "1000px",
                maxHeight: "100vh",
              }}
            >
              <Document
                file={resumesList[currentResumeIndex]}
                onLoadError={console.error}
              >
                <Page
                  pageNumber={1}
                  scale={
                    window.innerWidth < 768
                      ? 0.8
                      : window.innerHeight < 800
                      ? 1.0
                      : 1.4
                  }
                />
              </Document>
            </div>
          </div>
        </div>
        <footer>
          <div className="flex justify-between mb-4">
            <button
              onClick={() => (window.location.href = "/jobdes")}
              className="px-4 py-2 bg-navyHeader text-white rounded-lg ml-4 shadow-md hover:bg-blue-400 transition duration-300 font-rubik"
            >
              ← Back: Job Description
            </button>
            <button
              onClick={completeResumes}
              className={`px-4 py-2 bg-navyHeader text-white rounded-lg mr-4 shadow-md hover:bg-blue-400 transition duration-300 font-rubik
              ${
                totalDecisions < 10
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-blue-400"
              }`}
              disabled={totalDecisions < 10}
            >
              Next: Resume Review pt. 2 →
            </button>
          </div>
        </footer>

        <Footer />
      </div>
    );
  }