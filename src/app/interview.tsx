<<<<<<< HEAD
export default function Interview(){ 
    <h1> This is a interivew page </h1>
=======
import React from 'react';
import Image from "next/image";

export default function Interview() {
  return (
     <div className="Homepage">
          <div className="Header">
            <h1>Pandployer</h1>
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
                width={16}
                height={16}
              />
              Discord
            </a>
          </footer>
        </div>
  );
>>>>>>> 0e1563c26fce79e4a1740df497d0aadf87386908
}