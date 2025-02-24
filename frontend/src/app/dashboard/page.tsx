import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useState, useEffect } from "react";
import "../styles/homepage.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
        const userData = await response.json();
        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="Homepage">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <div className="Header" >
        <a href = "#" className= "nav">
          <div className="one"></div>
          <div className="two"></div>
          <div className="three"></div>
        </a>
      
        <Link href="/"  className = "home-button"> Pandployer </Link>
      
      </div>  
      <main className="Options">
        <div className="Video">
          <iframe 
            width="1020"
            height="630"
            src="https://www.youtube.com/embed/fHpVPkIGVyY?si=9L9JBYH8sWTEZYe6" 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            className ="ATS-IMG"
            style={{ display: 'block', margin: '0 auto' }}
          ></iframe>
          Watch to Learn about ATS
        </div>
         <CreateButtons />
      </main>


      <footer>
        <a
          className="Discord link"
          href="https://discord.gg/XNjg2VMR"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/discord.svg"
            alt="Discord icon"
            width={25}
            height={25}
            style = {{display: "inline"}}
          />
          <p style = {{display: "inline"}}> Join our Discord</p>
        </a>
      </footer>
    </div>
  );
}

function CreateButtons() {
  return (
    <div className = "Buttons">
          <Link href="/interview" className ="button">
           Interview
          </Link>
          <Link href="/jobdes" className ="button">
           Job Description
          </Link>
          <Link href="/res-review" className ="button">
           Resume-Review 
          </Link>
    </div>
  );
}


export default Dashboard;
