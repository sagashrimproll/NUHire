import { useEffect } from "react";

const allowedRoutes: Record<string, string[]> = {
  "/jobdes": ["job-description", "res-review", "interview"],
  "/res-review": ["res-review", "interview"],
  "/interview": ["interview"],
};

export const useProgress = () => {
  useEffect(() => {
    const progress = localStorage.getItem("progress") || "job-description"; 
    const currentPath = window.location.pathname;

    if (!(currentPath in allowedRoutes)) return;


    if (!allowedRoutes[currentPath].includes(progress)) {
      window.location.replace(`/${progress}`); 
    }
  }, []);
};