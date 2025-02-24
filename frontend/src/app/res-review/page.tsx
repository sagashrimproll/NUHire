'use client';
import React from "react";
import { useProgress } from "../components/useProgress";
import Navbar from "../components/navbar";


export default function ResumesPage() {
  useProgress();
  
  const completeResumes = () => {
    localStorage.setItem("progress", "interview");
    window.location.href = '/interview';
  }
    return (
      <div>
        <Navbar />
        <h1>Resumes Page</h1>
        <p>Content for the resumes page...</p>
        <button onClick={() => window.location.href = '/jobdes'}>Back to Job Description</button>
        <button onClick={completeResumes}>Next: Interview</button>
      </div>
    );
  }