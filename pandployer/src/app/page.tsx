import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="Homepage">
      <main className="Options">
        <a href = "src/app/interview.tsx">
          <button className="interview">Interview </button>
          </a>
          <a href = "src/app/jobdes.tsx">
          <button className="jobdes">Job Description </button>
          </a>
          <a href = "src/app/offer.tsx">
          <button className="offer">Send Offer </button>
          </a>
          <a href = "src/app/res-review.tsx">
          <button className="res-review">Resume Review </button>
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
