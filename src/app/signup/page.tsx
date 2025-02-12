import { signInWithGoogle } from '../backend/OAuth';
import Link from 'next/link';
import '../styles/signup.css';


export default function SignupPage() { 
  return (
    <div> 
      <h1>Sign Up</h1>
      <div className = "name">
      <h2 className = "firstname">First Name: 
        <input type="text" id="fname" name="fname"/>
      </h2>  
      <h2 className = "lastname">Last Name:
        <input type="text" id="lname" name="lname"/>
      </h2>
    </div>
    <h2 className = "affiliation">Northeastern Affiliation: 
      <select id="affiliation" name="affiliation">
        <option value="none">Pick One</option>
        <option value="student">Student</option>
        <option value="advisor">Faculty</option>
      </select>
    </h2>
    <button /* onClick={signInWithGoogle} */ className = "OAuth">Sign up with Google</button>
    <p>Already have an account?
    <Link href="/login"> Click here!</Link>
    </p>
    <p>Seems like you already have an account. <Link href="/login">Click here to login.</Link></p>
    </div> 
  )
}