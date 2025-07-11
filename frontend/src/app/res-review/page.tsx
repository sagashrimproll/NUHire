"use client";
export const dynamic = "force-dynamic";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import { useProgress } from "../components/useProgress";
import Navbar from "../components/navbar";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Notes from "../components/note";
import { Document, Page, pdfjs } from "react-pdf";
import NotesPage from "../components/note";
import Footer from "../components/footer";
import router from "next/router";
import Popup from "../components/popup";
import { io } from "socket.io-client";
import { usePathname } from "next/navigation";

const socket = io(API_BASE_URL);

// Necessary for any page that requires to display pdfs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ResumesPage() {
  useProgress();

  const [resumes, setResumes] = useState(0);
  const [resumesList, setResumesList] = useState<{ file_path: string }[]>([]); // list of all resumes
  
  // out of all resumes, how many were accepted, rejected and skipped
  const [accepted, setAccepted] = useState(0); 
  const [rejected, setRejected] = useState(0);
  const [noResponse, setNoResponse] = useState(0);

  // each resume has a 30 second time limit, and if a decision is not made by then, it's skipped and the resume is stored as no-response
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [currentResumeIndex, setCurrentResumeIndex] = useState(0);
  const [fadingEffect, setFadingEffect] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{
    headline: string;
    message: string;
  } | null>(null);
  const pathname = usePathname();
  const [restricted, setRestricted] = useState(false);
  interface User {
    id: string;
    group_id: string;
    email: string;
    class: number;
  }

  const [user, setUser] = useState<User | null>(null);

  const totalDecisions = accepted + rejected + noResponse;
  const maxDecisions = totalDecisions >= 10;

  const resumeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
          credentials: "include",
        });
        const userData = await response.json();

        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user && user.email) {
      socket.emit("studentOnline", { studentId: user.email });

      socket.emit("studentPageChanged", {
        studentId: user.email,
        currentPage: pathname,
      });

      const updateCurrentPage = async () => {
        try {
          await fetch(`${API_BASE_URL}/update-currentpage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page: "resumepage",
              user_email: user.email,
            }),
          });
        } catch (error) {
          console.error("Error updating current page:", error);
        }
      };

      updateCurrentPage();
    }
  }, [user, pathname]);

  // There special types of Popups; the advisor sends an internal refferal popup, then the users have to accept this Resume
  // Suggestions: In the next stage of the application, the users can still not select the resume to send to interview stage, that's not how it works
  // Make it so that any resume that has an internal refferal has an automatic check and is selected to send to the resume stage and it cannot be unchecked.
  useEffect(() => {
    socket.on("receivePopup", ({ headline, message }) => {
      setPopup({ headline, message });

      if (headline === "Internal Referral") {
        setRestricted(true);
      } else {
        setRestricted(false);
      }
    });

    return () => {
      socket.off("receivePopup");
    };
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resume_pdf`);
      const data = await response.json();
      setResumesList(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentResumeIndex]);

  // each resume based on yes no or skipped, is saved in the backend so it's useful in other stages in the application
  const sendVoteToBackend = async (vote: "yes" | "no" | "unanswered") => {
    if (!user || !user.id || !user.group_id) {
      console.error("Student ID not found");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/resume/vote`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: user.id,
          group_id: user.group_id,
          class: user.class,
          timespent: timeSpent,
          resume_number: currentResumeIndex + 1,
          vote: vote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error("Failed to save vote");
      }
      console.log("Vote saved successfully");
    } catch (error) {
      console.error("Error sending vote to backend:", error);
    }
  };

  const nextResume = () => {
    if (currentResumeIndex < resumesList.length - 1) {
      setFadingEffect(true);
      setTimeout(() => {
        setCurrentResumeIndex(currentResumeIndex + 1);
        setRestricted(false);
        setTimeRemaining(30);
        setTimeSpent(0);
        setFadingEffect(false);

        if (resumeRef.current) {
          resumeRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (timeRemaining > 0 && !maxDecisions) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !maxDecisions && restricted) {
      handleAccept();
    } else if (timeRemaining === 0 && !maxDecisions) {
      handleNoResponse();
    }
  }, [timeRemaining]);

  const handleAccept = () => {
    if (maxDecisions) return;
    sendVoteToBackend("yes");
    setAccepted((prev) => prev + 1);
    setResumes((prev) => prev + 1);
    nextResume();
  };

  const handleReject = () => {
    if (maxDecisions) return;
    sendVoteToBackend("no");
    setRejected((prev) => prev + 1);
    setResumes((prev) => prev + 1);
    nextResume();
  };

  const handleNoResponse = () => {
    if (maxDecisions) return;
    sendVoteToBackend("unanswered");
    setNoResponse((prev) => prev + 1);
    nextResume();
  };

  const completeResumes = () => {
    localStorage.setItem("progress", "res-review-group");
    window.location.href = "/res-review-group";
  };

  return (
    <div>
      <Navbar />

      <div className="flex items-right justify-end">
        <NotesPage />
      </div>

      <div className="flex justify-center items-center font-rubik text-navyHeader text-3xl font-bold mb-3">
        <h1>Resume Review Part 1</h1>
      </div>

      <div className="flex flex-col items-center font-rubik text-navyHeader text-center space-y-5 mb-6">
        <h3>
          Review the resume and decide whether to accept, reject, or mark as
          no-response.
        </h3>
        <h3> You may accept as many as you like out of the 10. </h3>
        <h3>
          But you are prompted to go back and select only 4 to move onto the
          second stage the review process
        </h3>
        <h3>
          Don't worry if you rejected or accepted a resume you agree/disagree
          with. This is why it's done in groups.
        </h3>
      </div>

      <div className="flex justify-between w-full p-6">
        <div className="flex flex-col gap-4">
          <div className="bg-navy shadow-lg rounded-lg p-6 text-sand text-lg text-center sticky top-0">
            <h2 className="text-lg">Time Remaining:</h2>
            <h2 className="text-3xl">{timeRemaining} sec</h2>
          </div>

          <div className="bg-navy shadow-lg rounded-lg p-6 text-sand text-lg">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-left">Resume</span>
              <span className="text-right">
                {currentResumeIndex + 1} / {resumesList.length}
              </span>
              <span className="text-left">Accepted</span>
              <span className="text-right">{accepted} / 10</span>
              <span className="text-left">Rejected</span>
              <span className="text-right">{rejected} / 10</span>
              <span className="text-left">No-response</span>
              <span className="text-right">{noResponse} / 10</span>
            </div>
          </div>

          <div className="flex items-center justify-center text-lg space-x-4 mt-4 sticky top-0">
            {!restricted && (
              <>
                <button
                  className="bg-[#a2384f] text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-red-600 hover:scale-105 transition duration-300"
                  onClick={handleReject}
                  disabled={resumes > 10}
                >
                  Reject
                </button>

                <button
                  className="bg-gray-500 text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105 transition duration-300"
                  onClick={handleNoResponse}
                  disabled={resumes > 10}
                >
                  Skip
                </button>
              </>
            )}

            <button
              className="bg-[#367b62] text-white font-rubik px-6 py-2 rounded-lg shadow-md hover:bg-green-600 hover:scale-105 transition duration-300"
              onClick={handleAccept}
              disabled={resumes > 10}
            >
              Accept
            </button>
          </div>
        </div>

        <div className="flex justify-center items-start w-4/5 h-screen overflow-auto bg-transparent">
          <div
            className={`display-resumes ${
              fadingEffect ? "fade-out" : "fade-in"
            } 
              shadow-lg rounded-lg bg-white p-4`}
            ref={resumeRef}
            style={{
              maxWidth: "1000px",
              maxHeight: "100vh",
            }}
          >
            {resumesList.length > 0 && resumesList[currentResumeIndex] ? (
              <Document
                file={`${API_BASE_URL}/${resumesList[currentResumeIndex].file_path}`}
                onLoadError={console.error}
              >
                <Page
                  pageNumber={1}
                  scale={
                    window.innerWidth < 768
                      ? 0.5
                      : window.innerHeight < 800
                      ? 1.0
                      : 1.0
                  }
                />
              </Document>
            ) : (
              <p>Loading resumes...</p>
            )}
          </div>
        </div>
      </div>

      {popup && (
        <Popup
          headline={popup.headline}
          message={popup.message}
          onDismiss={() => setPopup(null)}
        />
      )}

      <footer>
        <div className="flex justify-between mb-4">
          <button
            onClick={() => (window.location.href = "/jobdes")}
            className="px-4 py-2 bg-navyHeader text-white rounded-lg ml-4 shadow-md hover:bg-blue-400 transition duration-300 font-rubik"
          >
            ← Back: Job Description
          </button>
          <button
            onClick={completeResumes}
            className={`px-4 py-2 bg-navyHeader text-white rounded-lg mr-4 shadow-md hover:bg-blue-400 transition duration-300 font-rubik
              ${
                totalDecisions < 10
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-blue-400"
              }`}
            disabled={totalDecisions < 10}
          >
            Next: Resume Review pt. 2 →
          </button>
        </div>
      </footer>

      <Footer />
    </div>
  );
}
