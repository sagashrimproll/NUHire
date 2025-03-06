'use client';

import Navbar from "../components/navbar"
import { useProgress } from "../components/useProgress";



export default function MakeOffer() {
    useProgress();

  const completeMakeOffer = () => {
    localStorage.setItem("progress", "employerPannel");
    window.location.href = '/employerPannel';
  }

  return (
    <div className="Interview">
      <Navbar /> 
      <h1> Make an Offer here </h1>
      <button onClick={completeMakeOffer}>Next: What would an Employer Do? </button>
    </div>
  );
}