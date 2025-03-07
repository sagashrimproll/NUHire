'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/navbar";

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
          router.push("/login"); // Redirect to login if unauthorized
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login"); // Redirect on error
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
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-3xl font-bold text-blue-600">Welcome to Employer For A Day 2.0</h1>
        
        <main className="mt-8">
          <div className="flex justify-center">
            <Link href="/grouping" className="px-6 py-3 text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transition">
              Create and View Groups
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
