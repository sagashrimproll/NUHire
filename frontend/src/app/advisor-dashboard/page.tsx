'use client';
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { localservices } from "googleapis/build/src/apis/localservices";
import NotesPage from "../components/note";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

    const isStepUnlocked = (stepKey: string) => {
      const completedSteps = steps.map(s => s.key);
      return completedSteps.indexOf(stepKey) <= completedSteps.indexOf(progress);
    };

    if (loading) {
      return <div>Loading...</div>; // Show a loading message while checking authentication
    }
  
    if (!user || user.affiliation !== "admin") {
      return null; // Prevent rendering the page if unauthorized
    }
    
  return (
    <div className="Homepage">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <Navbar />
      <div className="webpage-info">
          <h1> Welcome to the Employer For A Day 2.0 </h1>
      </div>
      <main className="Options">

        <div className="Buttons">
          <Link href="/grouping">Create and View Groups</Link>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;