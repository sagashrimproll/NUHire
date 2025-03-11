'use client';
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NavbarAdmin from "../components/navbar-admin";
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
    <div className="flex flex-col min-h-screen bg-sand font-rubik">
      <NavbarAdmin />

      <div className="flex justify-center items-center py-10">
        <h1 className="text-4xl font-bold text-navy text-center">
          Welcome to Employer For A Day 2.0
        </h1>
      </div>

      <main className="flex flex-col items-center justify-center flex-grow">
        <div className="mt-6">
          <Link 
            href="/grouping" 
            className="px-10 py-10 bg-navy text-sand border-4 border-wood font-semibold rounded-lg shadow-md hover:bg-springWater transition"
          >
            Create and View Groups
          </Link>
        </div>
      </main>
    </div>

  );
}

export default Dashboard;