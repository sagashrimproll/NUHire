import Link from 'next/link';
import '../styles/signup.css';


export default function LoginPage() { 
  return (
    <div> 
      <h1>Login In </h1>
      <div className = "email">
        <h2 className = "email">Email:
        <input type="text" id="email" name="email"/>
        </h2>
    </div>
    <div className = "password">
        <h2 className = "password">Password: 
        <input type="text" id="password" name="password"/>
        </h2>
    </div>
    <button /* onClick={signInWithGoogle} */ className = "OAuth">Sign up with Google</button>
    <p>You don't have an account?
    <Link href="/signup"> Click here to signup!</Link>
    </p>
    <p>Forgot password. <Link href="/forgotPassword">Click here to reset your password.</Link></p>
    </div> 
  )
}