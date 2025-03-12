'use client';
import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import NotesPage from "../components/note";
import Footer from "../components/footer";

interface User {
  email: string;
  affiliation: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [progress, setProgress] = useState<string>("job-description"); // Default to first step

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
        const userData = await response.json();

        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
          router.push("/login"); // 🔥 Redirect to login if unauthorized
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login"); // 🔥 Redirect on error
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user && user.email) {
      const updateCurrentPage = async () => {
        try {
          const response = await fetch("http://localhost:5001/update-currentpage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: 'dashboard', user_email: user.email }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update current page:", errorData.error);
          }
        } catch (error) {
          console.error("Error updating current page:", error);
        }
      };

      updateCurrentPage();
    }
  }, [user]);
  
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

    if (loading) {
      return <div>Loading...</div>; // Show a loading message while checking authentication
    }
  
    if (!user || user.affiliation !== "student") {
      return null; // Prevent rendering the page if unauthorized
    }
    
  return (
    <div className="bg-[#d3dadc]">
      <Navbar />
      <div className="flex items-right justify-end">
        <NotesPage />
      </div>

      <div className="flex flex-col items-center font-rubik text-navyHeader text-center space-y-7 mb-6">
        <h1 className="text-4xl font-extrabold mb-4">
          Welcome to the Employer For A Day 2.0
        </h1>
        <p className="text-lg text-gray-800">
          This is a tool to help you prepare for your job search.
        </p>
        <p className="text-lg text-gray-800">
          We will guide you through what happens after you apply for an job
          position.
        </p>
        <p className="text-lg text-gray-800">
          This includes what employers see when they get resumes, how they make
          decisions and what they are looking for.
        </p>
        <p className="text-xl font-bold text-black">BUT HERE'S THE TWIST</p>
        <p className="text-lg text-gray-800">
          You play employer, we provide applicants.
        </p>
      </div>
      <main className="Options">
        <div className="flex flex-col items-center text-center p-6">
          <h1 className="text-2xl font-rubik font-bold mb-4">
            Get started with learning about ATS
          </h1>

          <div className="w-full max-w-5xl aspect-video border-4 border-[#1c2a63] mb-5 rounded-lg shadow-lg">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/fHpVPkIGVyY?si=9L9JBYH8sWTEZYe6"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="flex font-extrabold text-3xl font-rubik text-[#1c2a63] justify-center items-center text-center p-6">
          <h3> Progress Bar</h3>
        </div>
        <div className="flex font-rubik flex-wrap gap-4 justify-center">
          {steps.map((step) => (
            <button
              key={step.key}
              onClick={() => window.location.replace(step.path)}
              disabled={!isStepUnlocked(step.key)}
              className={`px-4 py-2 text-lg rounded-md transition-all mb-10
        ${
          isStepUnlocked(step.key)
            ? "bg-[#455763] text-white cursor-pointer hover:bg-[#142050]"
            : "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60"
        }`}
            >
              {step.label}
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;