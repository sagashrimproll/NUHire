'use client'; //Declares that this page is a client component
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // API base URL from environment variables
import React, { useState, useEffect } from "react"; // Importing React and hooks for state and effect management
import { useRouter } from "next/navigation"; // Importing useRouter for navigation
import Link from "next/link"; // Importing Link for client-side navigation
import NavbarAdmin from "../components/navbar-admin"; // Importing the admin navbar component

const Dashboard = () => {

  // Define the User interface to match the expected user data structure
  interface User {
    id: number;
    name: string;
    email: string;
    affiliation: string;
  }

  // State variables to manage user data and loading state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user data from the API when the component mounts
  // and handle redirection if the user is not an admin
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

  // If loading, show a loading message
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  if (!user || user.affiliation !== "admin") {
    // If the user is not an admin, redirect to the home page
    router.push("/");
    return null; // Return null to avoid rendering anything else
  }

  // Render the dashboard if the user is an admin
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
