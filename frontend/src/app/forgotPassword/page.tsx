'use client';

import Link from 'next/link';
import '../styles/signup.css';


export default function ForgotPasswordPage() {
    return (
        <div>
        <h1>Forgot Password</h1>
        <div className="email">
            <h2 className="email">Email:
            <input type="text" id="email" name="email"/>
            </h2>
        </div>
        <button /* onClick={signInWithGoogle} */ className="OAuth">Send Reset Link</button>
        <p>Remembered your password? 
            <Link href="/login"> Click here to login.</Link>
        </p>
        <p>Don't have an account?
            <Link href="/signup"> Click here to signup!</Link>
        </p>
        </div>
    )
    }