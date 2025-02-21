'use client';
import { useState } from 'react';
import Link from 'next/link';
import '../styles/signup.css';

const Signup = () => {
  const [message, setMessage] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/auth/google"; // Redirects to the backend OAuth flow
  };

  return (
    <div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />

      <h1 className="signup">Sign Up</h1>
      
      <div className="oauth-container">
        <button onClick={handleGoogleLogin} className="oauth">
          Sign in with Google
        </button>
      </div>

      {message && <p>{message}</p>}
      <p>
        Already have an account?
        <a href="/login"> Click here!</a>
      </p>
    </div>
  );
};

export default Signup;
