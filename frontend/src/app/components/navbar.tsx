"use client"

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  

  // Code for user progress 
  const [progress, setProgress] = useState<string>("job-description");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProgress = localStorage.getItem("progress") || "job-description";
      setProgress(storedProgress);
    }
  }, []);
  const steps = [
    { key: "jobdes", label: "Job Description", path: "/jobdes" },
    { key: "res-review", label: "Resume Review", path: "/res-review" },
    { key: "res-review-group", label: "Resume Review Group", path: "/res-review-group" },
    { key: "interview", label: "Interview", path: "/interview" },
    { key: "makeOffer", label: "Make an Offer", path: "/makeOffer" },
    { key: "employerPannel", label: "Employer Panel", path: "/employerPannel" },
  ];

  const isStepUnlocked = (stepKey: string) => {
    const completedSteps = steps.map(s => s.key);
    return completedSteps.indexOf(stepKey) <= completedSteps.indexOf(progress);
  };


  return (
    <nav className="navbar">
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          <a className="nav">
          <div className="one"></div>
          <div className="two"></div>
          <div className="three"></div>
          </a>
          </div>
      

        <Link href="/dashboard"  className = "home-button"> 
        Pandployer 
        </Link>

        <Link href="/userProfile" className="user_profile">
          <div className="user-icon"></div>
          </Link>

        {isOpen && 
          <div className="dropdown" onClick={() => setIsOpen(!isOpen)}> 
          <Link href="/dashboard" className="dropdown-item"> 
          Dashboard
          </Link>
          <Link href="/userProfile" className="dropdown-item">
          Profile
          </Link>
          <Link href="/notes" className="dropdown-item">
          Notes
          </Link>
          {steps
          .filter(step => isStepUnlocked(step.key))
          .map((step) => (
            <Link key={step.key} href={step.path} className="dropdown-item">
              {step.label}
              </Link>
          ))}
          </div>
        }

        </nav>
  );
};

export default Navbar;