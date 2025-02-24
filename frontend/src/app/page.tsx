'use client';
import Image from "next/image";
import Link from "next/link";
import React from "react";
import "./styles/homepage.css";

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/auth/google"; // Redirect to OAuth
  };
  
  return (
    <div className="Homepage">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <div className="loginbar" >
      
        <Link href="/signup"  className = "navbutton"> Signup </Link>
        <button onClick={handleGoogleLogin} className = "navbutton-login"> Login </button>
      </div>  
      <main className="mainbody">
         <div className ="welcome">Welcome to Pandployer!</div>
         <div className ="description">Where you can be your own employer!</div>
         <Link href="/signup" className = "signupbutton">Click Here to Get Started</Link>
      </main>


      <footer>
        <a
          className="Discord link"
          href="https://discord.gg/XNjg2VMR"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/discord.svg"
            alt="Discord icon"
            width={25}
            height={25}
            style = {{display: "inline"}}
          />
          <p style = {{display: "inline"}}> Join our Discord</p>
        </a>
      </footer>
    </div>
  );
}
