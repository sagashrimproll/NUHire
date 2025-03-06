<<<<<<< HEAD
"use client";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
=======
'use client';
import Navbar from "../components/navbar"
>>>>>>> b27856c05e70fb163188d69b228cd0bbb226c7de

export default function UserProfile() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5001/auth/logout", {
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
      <Navbar />
      <h1>User Profile Page</h1>
      <p>Content will be stored here</p>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}
