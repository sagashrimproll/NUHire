'use client';
import Image from "next/image";
import React from "react";
import './globals.css';


export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/auth/google"; // Redirect to OAuth
  };

  return (
    <div className={'flex flex-col min-h-screen items-center justify-center bg-sand font-rubik'}>

      {/* Navigation Bar */}
      <div className="w-full flex justify-end p-2 bg-navy shadow-md font-rubik text-2xl fixed top-0">
        <button 
          onClick={handleGoogleLogin} 
          className="m-2 px-2 py-2 bg-sand text-black border-4 border-wood rounded-md text-lg transition-opacity hover:opacity-60 active:opacity-30"
        >
          Signup
        </button>
        <button 
          onClick={handleGoogleLogin} 
          className="m-2 px-2 py-2 bg-wood text-black border-4 border-sand rounded-md text-lg transition-opacity hover:opacity-60 active:opacity-30"
        >
          Login
        </button>
      </div>

      {/* Main Content */}
      <main className="bg-sand justify-center items-center flex flex-col p-6">
        <h1 className="text-5xl font-bold">Welcome to NUHire!</h1>
        <p className="text-2xl italic mt-2">Where you can be your own employer!</p>
        <button 
          onClick={handleGoogleLogin} 
          className="mt-6 px-6 py-4 bg-white text-black border-4 border-navy rounded-md text-lg transition-opacity hover:opacity-60 active:opacity-30"
        >
          Click Here to Get Started
        </button>
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-center p-2 bg-navy shadow-md font-rubik text-2xl fixed bottom-0">
        <a
          className="flex items-center text-wood hover:text-blue-700 transition"
          href="https://discord.gg/XNjg2VMR"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/discord.svg" alt="Discord icon" width={25} height={25} />
          <span>Join our Discord</span>
        </a>
      </footer>
    </div>
  );
}
