

import { useEffect } from "react";

const allowedRoutes: Record<string, string[]> = {
  "/jobdes": ["jobdes", "res-review", "res-review-group", "interview-stage", "makeOffer", "employerPanel"],
  "/res-review": ["res-review", "interview-stage"],
  "/res-review-group": ["res-review-group", "interview-stage"],
  "/interview-stage": ["interview-stage", "makeOffer"],
  "/makeOffer": ["makeOffer", "employerPanel"],
  "/employerPanel": ["employerPanel"],
};

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