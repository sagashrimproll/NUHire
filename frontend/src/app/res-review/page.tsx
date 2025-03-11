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

  const totalDecisions = accepted + rejected + noResponse;
  const maxDecisions = totalDecisions >= 10;

  const resumeRef = useRef<HTMLDivElement | null>(null);

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
            {" "}
            Review the resume and decide whether to accept, reject, or mark as
            no-response.{" "}
          </h3>
          <h3> You may accept as many as you like out of the 10. </h3>
          <h3>
            {" "}
            But you are prompted to go back and select only 4 to move onto the
            second stage the review process{" "}
          </h3>
          <h3>
            {" "}
            Don't worry if you rejected or accepted a resume you agree/disagree
            with. This is why it's done in groups.
          </h3>
        </div>

        <div className="flex justify-between w-full p-4">
          <div className="bg-navy shadow-lg rounded-lg p-6 w-1/4 text-sand text-xl flex flex-col justify-between">
            <h2 className="text-2xl">Time Remaining:</h2>
            <h2 className="text-4xl text-center mt-auto">
              {timeRemaining} sec
            </h2>
          </div>

          <div className="bg-navy shadow-lg rounded-lg p-6 w-1/4 text-sand text-xl">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-left">Resume Number:</span>{" "}
              <span className="text-right">
                {currentResumeIndex + 1} / {resumesList.length}
              </span>
              <span className="text-left">Accepted:</span>{" "}
              <span className="text-right">{accepted} / 10</span>
              <span className="text-left">Rejected:</span>{" "}
              <span className="text-right">{rejected} / 10</span>
              <span className="text-left">No-response:</span>{" "}
              <span className="text-right">{noResponse} / 10</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center w-full h-screen bg-transparent">
  <div 
    className={`display-resumes ${fadingEffect ? "fade-out" : "fade-in"} 
    shadow-lg rounded-lg bg-white p-4`}
    ref={resumeRef}
    style={{ 
      maxWidth: "900px", // Keeps a reasonable width
      maxHeight: "100vh", // Ensures it never overflows
    }}
  >
    <Document
      file={resumesList[currentResumeIndex]}
      onLoadError={console.error}
    >
      <Page 
        pageNumber={1} 
        scale={window.innerWidth < 768 ? 0.8 : window.innerHeight < 800 ? 0.9 : 1.1} 
      />
    </Document>
  </div>
</div>

        <div className="flex items-center justify-center space-x-4 mt-4">

        <button
            className="bg-red-500 text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-red-600 hover:scale-105 transition duration-300"
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
            className="bg-green-500 text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-green-600 hover:scale-105 transition duration-300"
            onClick={handleAccept}
            disabled={resumes > 10}
          >
            Accept
          </button>
          </div>

        <footer>
          <div className="flex justify-between mt-4 mb-4">
            <button
              onClick={() => (window.location.href = "/jobdes")}
              className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-blue-400 transition duration-300 font-rubik"
            >
              ← Back: Job Description
            </button>
            <button
              onClick={completeResumes}
              className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-blue-400 transition duration-300 font-rubik"
            >
              Next: Resume Review pt. 1 →
            </button>
          </div>
        </footer>

        <Footer />
      </div>
    );
  }