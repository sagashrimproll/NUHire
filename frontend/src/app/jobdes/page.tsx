'use client'

import Navbar from "../components/navbar"

export default function JobDescriptionPage() { 
    const completeJobDescription = () => {
        localStorage.setItem("progress", "res-review");
        window.location.href = '/res-review';
      }
return (
    <div>
        <Navbar />
        <h1> Job description Page </h1>
        <p> Content will be stored here </p>
        <p> Complete this section before moving on to the next </p>
        <button onClick={completeJobDescription}> Next: Resume </button>
        </div> 
)
}
