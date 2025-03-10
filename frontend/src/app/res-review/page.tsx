'use client';
import React, { useEffect, useState, useRef } from "react";
import { useProgress } from "../components/useProgress";
import Navbar from "../components/navbar";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css"
import Notes from "../components/note";
import { Document, Page, pdfjs } from "react-pdf";


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
        <Notes />

        <div className="resume-header-container">
          <h1>Resume Review pt.1</h1>
        </div>
        <div className="resume-instructions">
        <h3> Review the resume and decide whether to accept, reject, or mark as no-response. </h3>
        <h3> You may accept as many as you like out of the 10. </h3>
        <h3> But you are prompted to go back and select only 4 to move onto the second stage the review process </h3>
        <h3> Don't worry if you rejected or accepted a resume you agree/disagree with. This is why it's done in groups.</h3>
        </div>
        <div className="info-container">
          <div className="time-stats">
          <h2>Time Remaining: {timeRemaining} seconds</h2>
          </div>

          <div className="resume-stats">
          <h2> Resume Number: {currentResumeIndex + 1} / {resumesList.length} </h2>
          <h2> Accepted: {accepted} / 10 </h2>
          <h2> Rejected: {rejected} / 10 </h2>
          <h2> No-response: {noResponse} / 10 </h2>
          </div>
        </div>

        {/*
        <div className="display-resumes"> 
          <h2> {resumesList[currentResumeIndex]} </h2>
          </div>
          */}
        
        <div className={`display-resumes ${fadingEffect ? 'fade-out' : 'fade-in'}`} ref={resumeRef}>
          <Document file={resumesList[currentResumeIndex]} onLoadError={console.error}>
            <Page pageNumber={1} scale={1.5} />
          </Document>
        </div>


        <div className="response-buttons">
          <button className="accept-button" onClick={handleAccept} disabled={resumes > 10}>Accept</button>
          <button className="reject-button" onClick={handleReject} disabled={resumes > 10}>Reject</button> 
          <button className="no-response-button" onClick={handleNoResponse} disabled={resumes > 10}>No-response</button>
        </div>

        <footer>
        <button onClick={() => window.location.href = '/jobdes'}>Back to Job Description</button>
        <button onClick={completeResumes} disabled={totalDecisions<10}>Next: Group Resume Review</button>
        </footer>
      </div>
    );
  }