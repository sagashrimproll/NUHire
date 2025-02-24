'use client';
import React from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import { useProgress } from "../components/useProgress";

export default function Interview() {
    useProgress();

  return (
    <div className="Interview">
      <Navbar /> 
      <h1> Information for Interview page </h1>
      <button onClick={() => window.location.href = '/res-review'}>Back to Resumes</button>
    </div>
  );
}
