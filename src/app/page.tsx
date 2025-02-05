import Image from "next/image";
import Link from "next/link";
import React from "react";
import YouTube from 'react-youtube';



export default function Home() {
  return (
    <div className="Homepage">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <div className="Header">
        <a href = "#" className= "nav">
          <div className="one"></div>
          <div className="two"></div>
          <div className="three"></div>
        </a>
        <h1>
          <Link href="/"  className = "home-button"> Pandployer </Link>
        </h1>
      </div>  
      <main className="Options">
        <div className="Video">
          <iframe 
            width="560" 
            height="315"
            src="https://www.youtube.com/embed/fHpVPkIGVyY?si=9L9JBYH8sWTEZYe6" 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          ></iframe>
          <p>Watch to Learn about ATS</p>
        </div>
        <div className = "Buttons">
          <Link href="/interview"> 
          <button> Interview </button>
          </Link>
          <Link href="/jobdes"> 
          <button> Job Description </button>
          </Link>
          <Link href="/res-review"> 
          <button> Resume-Review </button>
          </Link>
        </div>
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
            width={16}
            height={16}
          />
          Discord
        </a>
      </footer>
    </div>
  );
}
