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
        if (affiliation === 'student') {
          router.push('/dashboard'); // Redirect after successful signup
        }
        if (affiliation === 'admin') {
          router.push('/advisor-dashboard'); // Redirect after successful signup
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to add user');
      }
    } catch (error) {
      setMessage('Failed to add user');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sand font-rubik">
      <h1 className="text-3xl font-bold text-navy mb-6">Complete Your Signup</h1>
  
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-navy shadow-lg rounded-lg p-6 flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="First Name" 
          className="w-full px-4 py-3 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)} 
          required 
        />

        <input 
          type="text" 
          placeholder="Last Name" 
          className="w-full px-4 py-3 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)} 
          required 
        />

        <input 
          type="email" 
          className="w-full px-4 py-3 border border-wood bg-springWater rounded-md bg-gray-200 cursor-not-allowed"
          value={email} 
          disabled 
        />

    <select 
      value={affiliation} 
      className="w-full px-4 py-3 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
      onChange={(e) => setAffiliation(e.target.value)} 
      required
    >
      <option value="none">Select Affiliation</option>
      <option value="student">Student</option>
      <option value="admin">Faculty</option>
    </select>

    <button 
      type="submit" 
      className="w-full bg-wood text-navy font-semibold px-4 py-3 rounded-md hover:bg-sand transition"
    >
      Submit
    </button>
  </form>

  {message && <p className="mt-4 text-green-600">{message}</p>}
</div>

  );
}
