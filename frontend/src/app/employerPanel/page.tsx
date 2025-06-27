'use client';

import React from 'react'
import Navbar from '../components/navbar'
import { useProgress } from '../components/useProgress';

export default function EmployerPannel() {
    useProgress();

    // this page is currently hidden, after they extend offers, it takes you directly back to home page, so change that and unlock this page
    // plans for this page: Potentially we would like employers to go through this application from their end, and record their reaction so this page serves as a page with that vid. 
    const completeAssignment = () => {
      localStorage.setItem("progress", "employerPannel");
      window.location.href = '/dashboard';
    }
      return (
        <div>
          <Navbar />
          <h1>Here is a video about what an employer would do...</h1>
          <button onClick={completeAssignment}>Back to Dashboard</button>
        </div>
      )
      
};