'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupDetails() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('none');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get email from URL query parameter (passed from Google OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('email');
    if (userEmail) {
      setEmail(userEmail);
    } else {
      setMessage('Authentication failed. Please try again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = { First_name: firstName, Last_name: lastName, Email: email, Affiliation: affiliation };
    try {
      const response = await fetch('http://localhost:5001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        setMessage('User added successfully!');
        router.push('/dashboard'); // Redirect after successful signup
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to add user');
      }
    } catch (error) {
      setMessage('Failed to add user');
    }
  };

  return (
    <div>
      <h1>Complete Your Signup</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <input type="email" value={email} disabled /> {/* Email is autofilled */}
        <select value={affiliation} onChange={(e) => setAffiliation(e.target.value)} required>
          <option value="none">Select Affiliation</option>
          <option value="student">Student</option>
          <option value="advisor">Faculty</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
