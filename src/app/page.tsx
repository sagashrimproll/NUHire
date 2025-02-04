import Image from "next/image";
import Link from "next/link";
import React from "react";


export default function Home() {
  return (
    <div className="Homepage">
      <div className="Header">
        <h1>Pandployer</h1>
      </div>  
      <main className="Options">
        <div className = "Video">
          <Image className="ATS-IMG"
            src="/ATSCoverIMG.png"
            alt="ATS Cover"
            width={500}
            height={500} />
          <a 
            className="ATS-video" 
            href="https://www.youtube.com/watch?v=fHpVPkIGVyY"
          /> ATS Video
  
        </div>
        <div className = "Buttons">
          <Link href="/interview" className = "button"> Interview Page </Link>
          <Link href="/jobdes"  className = "button"> Job Description </Link>
          <Link href="/res-review"  className = "button"> Resume Review </Link>
          <Link href="/"  className = "button"> Home </Link>
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
