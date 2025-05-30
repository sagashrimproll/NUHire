"use client" // Declares that this page is a client component
import React from "react"; // Importing React
import Link from "next/link"; // Importing Link for client-side navigation
import { useState } from "react"; // Importing useState for managing state

const NavbarAdmin = () => {

  // State variable to manage the open/close state of the dropdown menu
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="bg-[#455763] text-white flex items-center justify-between px-6 py-4 font-rubik">
        <div
          className="relative flex flex-col space-y-1 ml-4 cursor-pointer group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="absolute top-0 w-5 h-1 bg-white rounded-full transition-all group-hover:w-7"></div>
          <div className="absolute top-0.5 w-4 h-1 bg-white rounded-full transition-all group-hover:w-7"></div>
          <div className="absolute top-2 w-3 h-1 bg-white rounded-full transition-all group-hover:w-7"></div>
        </div>

        {isOpen && (
          <div className="absolute top-12 left-2 bg-white w-48 rounded-md shadow-lg p-3 transition-all duration-300 ease-in-out">
            <Link
              href="/advisor-dashboard"
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
              href="/grouping"
              className="block px-4 py-2 text-[#1c2a63] hover:bg-gray-200 rounded-md"
            >
              Create and View Groups
            </Link>

            <Link
              href="/sendpopups"
              className="block px-4 py-2 text-[#1c2a63] hover:bg-gray-200 rounded-md"
            >
              Send Popups
            </Link>

            <Link
              href="/new-pdf"
              className="block px-4 py-2 text-[#1c2a63] hover:bg-gray-200 rounded-md"
            >
              Upload Jobs and Resumes
            </Link>
          </div>
        )}
        <Link
          href="/advisor-dashboard"
          className="text-3xl font-rubik font-bold"
        >
          NUHire
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

export default NavbarAdmin;