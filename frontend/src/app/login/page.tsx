'use client';
import Link from 'next/link';
import '../styles/signup.css';
import { useState } from 'react';


export default function LoginPage() { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = {
      Email: email,
      Password: password
    };

    console.log('Retreving User:', user);

    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      console.log('Response:', response);

      if (response.ok) {
        setMessage('Loggin in!');
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
        <input type="text" id="email" name="email"
        onChange={e => setEmail(e.target.value)}/>
        </h2>
    </div>
    <div className = "password">
        <h2 className = "password">Password: 
        <input type="text" id="password" name="password"
        onChange={e => setPassword(e.target.value)}/>
        </h2>
    </div>
    {message && <p>{message}</p>}
    </form>
    <button /* onClick={signInWithGoogle} */ className = "OAuth">Sign up with Google</button>
    <p>You don't have an account?
    <Link href="/signup"> Click here to signup!</Link>
    </p>
    <p>Forgot password. <Link href="/forgotPassword">Click here to reset your password.</Link></p>
    </div> 
  )
}