import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
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


