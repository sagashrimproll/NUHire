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
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
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
      <h1>User Profile Page</h1>
      <p>Content will be stored here</p>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}
