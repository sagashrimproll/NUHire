'use client';
import React from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import { useProgress } from "../components/useProgress";

export default function Interview() {
    useProgress();

  const completeInterview = () => {
    localStorage.setItem("progress", "makeOffer");
    window.location.href = '/makeOffer ';
  }

  return (
    <div className="Interview">
      <Navbar /> 
      <h1> Information for Interview page </h1>
      <button onClick={completeInterview}>Next: Make offer page</button>
    </div>
  );
}
