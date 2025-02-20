'use client';
import Link from 'next/link';
import '../styles/signup.css';
import { useState } from 'react';


export default function LoginPage() { 
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = {
      Email: email
    };

    console.log('Retreving User:', user);

    try {
      const response = await fetch('http://localhost:5000/users/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });

      console.log('Response:', response);

      if (response.ok) {
        const data = await response.json();
        setMessage('Logging in!');
        window.location.href = '../dashboard'; // Redirect to the welcome page
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to Login');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to Log in');
    }
  };
  
  return (
    <div> 
      <h1>Login In </h1>
      <form onSubmit={handleSubmit}>
      <div className = "email">
        <h2 className = "email">Email:
        <input type="email" id="email" name="email" value = {email}
        onChange={e => setEmail(e.target.value)} required/>
        </h2>
    </div>
    <button type="submit">Login</button>
    {message && <p>{message}</p>}
    </form>
    <p>You don't have an account?
    <button /* onClick={signInWithGoogle} */ className = "OAuth">Sign up with Google</button>
    </p>
    <p>Forgot password. <Link href="/forgotPassword">Click here to reset your password.</Link></p>
    </div> 
  )
}