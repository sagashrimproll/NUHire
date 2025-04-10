"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import NavbarAdmin from "../components/navbar-admin";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" });
          const userData = await response.json();
  
          if (response.ok) {
            setUser(userData);
          } else {
            setUser(null);
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          router.push("/");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include", // ✅ Ensures cookies clear if using sessions
      });

      if (response.ok) {
        router.push("/"); // ✅ Redirect to home page
      } else {
        console.error("Failed to logout:", response.statusText);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      {user?.affiliation !== "admin" ? <Navbar /> : <NavbarAdmin />}
    <div className=" bg-gradient-to-navy from-springWater via-sand to-wood text-white flex flex-col items-center justify-center p-6 min-h-screen">
  
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-300">User Profile</h1>
  
        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 transition-all duration-300 rounded-lg shadow-md text-white font-semibold text-lg"
        >
          Logout
        </button>
      </div>
    </div>
    </div>
  );
}  
