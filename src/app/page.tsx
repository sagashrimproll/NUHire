import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="Homepage">
      <div className="Header">
        <h1>Pandployer</h1>
      </div>  
      <main className="Options">
        <Link href="/interview.tsx">
          <button className="button">Interview</button>
        </Link>
        <a href="src/app/jobdes.tsx">
          <button className="button">Job Description </button>
          </a>
          <a href = "src/app/offer.tsx">
          <button className="button">Send Offer </button>
          </a>
          <a href = "src/app/res-review.tsx">
          <button className="button">Resume Review</button>
          </a>
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
