import { useEffect } from "react";

const allowedRoutes: Record<string, string[]> = {
  "/jobdes": ["jobdes", "res-review", "res-review-group", "interview", "makeOffer", "employerPannel"],
  "/res-review": ["res-review", "interview"],
  "/res-review-group": ["res-review-group", "interview"],
  "/interview": ["interview", "makeOffer"],
  "/makeOffer": ["makeOffer", "employerPannel"],
  "/employerPannel": ["employerPannel"],
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