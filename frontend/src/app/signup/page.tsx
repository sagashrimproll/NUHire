'use client';
import { useState } from 'react';
import Link from 'next/link';
import '../styles/signup.css';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('none');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = {
      First_name: firstName,
      Last_name: lastName,
      Email: email,
      Affiliation: affiliation,
    };

    console.log('Submitting user:', user); // Add logging

    try {
      const response = await fetch('http://localhost:5001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      console.log('Response:', response); // Add logging

      if (response.ok) {
        setMessage('User added successfully!');
        window.location.href = '../dashboard'; // Redirect to the welcome page
      } else {
        const errorData = await response.json();
        if (errorData.message === 'User already exists') {
          setMessage('Seems like you already have an account under this email. Please log in.');
        } else {
          setMessage(errorData.message || 'Failed to add user');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to add user');
    }
  };

  return (
    <div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <h1 className = "signup">Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="body">
          <h2 className="firstname">
            First Name:
            <input
              type="text"
              id="fname"
              name="fname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </h2>
          <h2 className="lastname">
            Last Name:
            <input
              type="text"
              id="lname"
              name="lname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </h2>
        <h2 className="email">
          Email:
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </h2>
        <h2 className="affiliation">
          Northeastern Affiliation: 
          <select
            id="affiliation"
            name="affiliation"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
          >
            <option value="none">Pick One</option>
            <option value="student">Student</option>
            <option value="advisor">Faculty</option>
          </select>
        </h2>
        <button type="submit" className="Oauth">
          Sign Up
        </button>
        </div>
      </form>
      {message && <p>{message}</p>}
      <p>
        Already have an account?
        <Link href="/login"> Click here!</Link>
      </p>
    </div>
  );
}