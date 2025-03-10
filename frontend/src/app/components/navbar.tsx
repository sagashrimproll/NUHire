import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="navbar">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />

      <div className="bg-[#455763] text-white flex items-center justify-between px-6 py-4">
        <div
          className="relative flex flex-col space-y-1 ml-4 cursor-pointer group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="absolute top-0 w-5 h-1 bg-white rounded-full transition-all group-hover:w-7"></div>
          <div className="absolute top-0.5 w-4 h-1 bg-white rounded-full transition-all group-hover:w-7"></div>
          <div className="absolute top-2 w-3 h-1 bg-white rounded-full transition-all group-hover:w-7"></div>
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-12 left-2 bg-white w-48 rounded-md shadow-lg p-3 transition-all duration-300 ease-in-out"
          >
            <Link
              href="/dashboard"
              className="block px-4 py-2 font-rubik text-[#1c2a63] hover:bg-gray-200 rounded-md"
            >
              Dashboard
            </Link>
            <Link
              href="/userProfile"
              className="block px-4 py-2 font-rubik text-[#1c2a63] hover:bg-gray-200 rounded-md"
            >
              Profile
            </Link>
            <Link
              href="/notes"
              className="block px-4 py-2 font-rubik text-[#1c2a63] hover:bg-gray-200 rounded-md"
            >
              Notes
            </Link>
            {steps
              .filter((step) => isStepUnlocked(step.key))
              .map((step) => (
                <Link
                  key={step.key}
                  href={step.path}
                  className="block px-4 py-2 text-[#1c2a63] hover:bg-gray-200 rounded-md"
                >
                  {step.label}
                </Link>
              ))}
          </div>
        )}
        <Link href="/dashboard" className="text-3xl font-rubik font-bold">
          Pandployer
        </Link>

        <Link
          href="/userProfile"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 cursor-pointer transition duration-300 ease-in-out hover:bg-gray-400 relative"
        >
          <div
            className="w-6 h-6 bg-cover bg-center rounded-full"
            style={{
              backgroundImage:
                "url('https://cdn-icons-png.flaticon.com/512/847/847969.png')",
            }}
          >
            {" "}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;