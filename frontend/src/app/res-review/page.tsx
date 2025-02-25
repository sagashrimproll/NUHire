'use client';
import React from "react";
import { useProgress } from "../components/useProgress";
import Navbar from "../components/navbar";


export default function ResumesPage() {
  useProgress();

  const completeResumes = () => {
    localStorage.setItem("progress", "res-review-group");
    window.location.href = '/res-review-group';
  }
    return (
      <div>
        <Navbar />
        <h1>Resumes Page</h1>
        <p>Content for the resumes page...</p>
        <button onClick={() => window.location.href = '/jobdes'}>Back to Job Description</button>
        <button onClick={completeResumes}>Next: Group Resume Review</button>
      </div>
    );
  }