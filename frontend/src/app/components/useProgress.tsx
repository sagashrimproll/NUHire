

import { useEffect } from "react";

// this is the order that a person can progress while going through the application
// if they go to another page that is restricted then they will automatically be reverted back to the current page.
const allowedRoutes: Record<string, string[]> = {
  "/jobdes": ["jobdes", "res-review", "res-review-group", "interview-stage", "makeOffer", "employerPanel"],
  "/res-review": ["res-review", "interview-stage"],
  "/res-review-group": ["res-review-group", "interview-stage"],
  "/interview-stage": ["interview-stage", "makeOffer"],
  "/makeOffer": ["makeOffer", "employerPanel"],
  "/employerPanel": ["employerPanel"],
};

// progress is kept through their brower status, so everytime they complete a page their status is updated in browser
// Improvement Suggestion: 
// could also make this in the db so that you're pulling info from db instead of someone's browser, but up to you...
export const useProgress = () => {
  useEffect(() => {
    const progress = localStorage.getItem("progress") || "jobdes"; 
    const currentPath = window.location.pathname;

    if (!(currentPath in allowedRoutes)) return;


    if (!allowedRoutes[currentPath].includes(progress)) {
      window.location.replace(`/${progress}`); 
    }
  }, []);
};