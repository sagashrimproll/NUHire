'use client';
import React from "react";
import Navbar from "../components/navbar";
import { useProgress } from "../components/useProgress";



export default function ResReviewGroup() {
    useProgress();

    const completeGroupResumeReview = () => {
      localStorage.setItem("progress", "interview");
      window.location.href = '/interview';
    }
      return (
        <div>
          <Navbar />
          <h1>Resume review as a group</h1>
          <p>Content for the group resume review...</p>
          <button onClick={completeGroupResumeReview}>Next: Interview</button>
        </div>
      );
}