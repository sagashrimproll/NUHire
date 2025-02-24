'use client';
import { useState } from 'react';
import Link from 'next/link';
import '../styles/signup.css';

export default function SignupPage() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/auth/google"; // Redirect to OAuth
  };

  return (
    <div>
      <h1 className="signup">Sign Up</h1>
      <div className="body">
        <button onClick={handleGoogleLogin} className="Oauth">
          Sign in with Google
        </button>
      </div>

      <p>Already have an account? <Link href="/login"> Click here!</Link></p>
    </div>
  );
}

