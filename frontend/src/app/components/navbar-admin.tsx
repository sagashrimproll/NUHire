"use client"
import React from "react";
import Link from "next/link";
import { useState } from "react";

const NavbarAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="navbar">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          <a className="nav">
          <div className="one"></div>
          <div className="two"></div>
          <div className="three"></div>
          </a>
          </div>
      

        <Link href="/advisor-dashboard"  className = "home-button"> 
        Pandployer 
        </Link>

        <Link href="/userProfile" className="user_profile">
          <div className="user-icon"></div>
          </Link>

        {isOpen && (
          <div className="dropdown" onClick={() => setIsOpen(!isOpen)}> 
          <Link href="/grouping" className="dropdown-item"> 
          Grouping
          </Link>
          <Link href="/jobdes" className="dropdown-item">
          Job Description
          </Link>
          <Link href="/res-review" className="dropdown-item">
          Resume Review
          </Link>
          <Link href="/interview" className="dropdown-item">
          Interview Page
          </Link>
          <Link href="/userProfile" className="dropdown-item">
          Profile
          </Link>
          </div>
        )}

        </nav>
  );
};

export default NavbarAdmin;