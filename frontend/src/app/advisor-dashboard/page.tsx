'use client';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarAdmin from "../components/navbar-admin";
import { localservices } from "googleapis/build/src/apis/localservices";
import NotesPage from "../components/note";

const Dashboard = () => {
  interface User {
    affiliation: string;
    // Add other user properties here
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" });
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/");
          }
          return;
        }
    
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchUser();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  if (!user || user.affiliation !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-sand font-rubik">
      <NavbarAdmin />

      <div className="flex justify-center items-center py-10">
        <h1 className="text-4xl font-bold text-navy text-center">
          Welcome to NUHire
        </h1>
      </div>

      <main className="flex flex-col items-center justify-center flex-grow">
        <div className="mt-6 gap-5 flex flex-col justify-center items-center">
          <Link
            href="/grouping"
            className="px-10 py-10 bg-navy text-sand border-4 border-wood font-semibold rounded-lg shadow-md hover:bg-navyHeader transition"
          >
            Create and View Groups
          </Link>
          <Link 
            href="/new-pdf" 
            className="px-10 py-10 bg-navy text-sand border-4 border-wood font-semibold rounded-lg shadow-md hover:bg-springWater transition"
          >
            Upload Job Descriptions and Resumes
          </Link>

          <Link
            href="/sendpopups"
            className="px-10 py-10 bg-navy text-sand border-4 border-wood font-semibold rounded-lg shadow-md hover:bg-navyHeader transition mt-6"
          >
            Send Popups
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
