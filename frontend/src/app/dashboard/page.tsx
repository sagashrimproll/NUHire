'use client';
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { localservices } from "googleapis/build/src/apis/localservices";
import NotesPage from "../components/note";

const Dashboard = () => {
  const [user, setUser] = useState(null);

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
      }
    };

    fetchUser();
  }, []);
  
    const [progress, setProgress] = useState<string>("job-description"); // Default to first step
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedProgress = localStorage.getItem("progress") || "job-description";
        setProgress(storedProgress);
      }
    }, []);
    const steps = [
      { key: "job-description", label: "Job Description", path: "/jobdes" },
      { key: "resume", label: "Resume Review", path: "/res-review" },
      { key: "interview", label: "Interview", path: "/interview" },
    ];

    const isStepUnlocked = (stepKey: string) => {
      const completedSteps = steps.map(s => s.key);
      return completedSteps.indexOf(stepKey) <= completedSteps.indexOf(progress);
    };
  return (
    <div className="Homepage">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <Navbar />
      <NotesPage />
      <div className="webpage-info">
          <h1> Welcome to the Employer For A Day 2.0 </h1>
          <p> This is a tool to help you prepare for your job search. </p>
          <p> We will guide you through the process of applying for a job, reviewing your resume, and preparing for an interview. </p>
          <p><strong> BUT HERE'S THE TWIST </strong></p>
          <p> You play employer, we provide applicants.</p>
      </div>
      <main className="Options">
        <div className="Video">
          <h1> Get started with learning about ATS </h1>
          <iframe 
            width="1020"
            height="630"
            src="https://www.youtube.com/embed/fHpVPkIGVyY?si=9L9JBYH8sWTEZYe6" 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            className ="ATS-IMG"
            style={{ display: 'block', margin: '0 auto' }}
          ></iframe>
        </div>

        <div className="Buttons">
          {steps.map((step) => (
            <button
            key={step.key}
            onClick={() => window.location.replace(step.path)}
            disabled={!isStepUnlocked(step.key)}
            style={{
              margin: "10px",
              padding: "10px",
              fontSize: "16px",
              cursor: isStepUnlocked(step.key) ? "pointer" : "not-allowed",
              backgroundColor: isStepUnlocked(step.key) ? "#1c2a63" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "5px",
              opacity: isStepUnlocked(step.key) ? 1 : 0.6,
            }}
          >
            {step.label}
          </button>
      ))}
        </div>
      </main>

      <footer>
        <a
          className="discord-link"
          href="https://discord.gg/XNjg2VMR"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="discord-icon"></div>
          <p style = {{display: "inline"}}> Join our Discord</p>
        </a>
      </footer>
    </div>
  );
}

export default Dashboard;
