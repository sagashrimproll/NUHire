import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="Homepage">
      <main className="Options">
      </main>

      <a 
        className="ATS video" 
        href="https://www.youtube.com/watch?v=fHpVPkIGVyY"
        > ATS Video </a>

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
