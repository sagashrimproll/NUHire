"use client";
import React, { useState, useEffect, use } from "react";
import { io, Socket } from "socket.io-client";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { useProgress } from "../components/useProgress";
import NotesPage from "../components/note";
import Footer from "../components/footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SOCKET_URL = `${API_BASE_URL}`;
let socket: Socket | null = null;

type VoteData = {
  Overall: number;
  Profesionality: number;
  Quality: number;
  Personality: number;
};

export default function MakeOffer() {
  useProgress();
  const router = useRouter();

  const [checkedState, setCheckedState] = useState<{ [key: number]: boolean }>({});
  const [voteCounts, setVoteCounts] = useState<{ [key: number]: VoteData }>({});
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [interviewVids, setInterviewVids] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviewsWithVideos, setInterviewsWithVideos] = useState<any[]>([]);
  

  // Load user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" });
        const userData = await response.json();
        if (response.ok) setUser(userData);
        else router.push("/login");
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user?.group_id) return;
  
    const fetchInterviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/interview/group/${user.group_id}`);
        const data = await response.json();
        
        setInterviews(data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      }
    };
    
    fetchInterviews();
  }, [user]);
  

  useEffect(() => {
    if (!interviews.length) return;
  
    const fetchCandidates = async () => {
      try {
        const fetchedCandidates = await Promise.all(
          interviews.map(async (interview) => {
            const id = interview.candidate_id;
            const res = await fetch(`${API_BASE_URL}/canidates/${id}`);
  
            if (!res.ok) {
              throw new Error(`Invalid response for candidate ${interview.candidate_id}`);
            }
  
            const data = await res.json();
            return data;
          })
        );
  
        console.log("Setting candidates:", fetchedCandidates);
        setCandidates(fetchedCandidates); // triggers re-render
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };
  
    fetchCandidates();
  }, [interviews]);

  useEffect(() => {
    if (!candidates.length) return;
  
    const fetchResumes = async () => {
      try {
        const fetchedResumes = await Promise.all(
          candidates.map(async (candidate) => {
            const id = candidate.resume_id;
            const res = await fetch(`${API_BASE_URL}/resume_pdf/id/${id}`);
  
            if (!res.ok) {
              throw new Error(`Invalid response for resume ${candidate.resume_id}`);
            }
  
            const data = await res.json();
            return data;
          })
        );
  
        console.log("Setting candidates:", fetchedResumes);
        setResumes(fetchedResumes); // triggers re-render
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };
  
    fetchResumes();
  }, [candidates]);
  
  const groupInterviewsByCandidate = (interviews: any[]) => {
    const grouped: { [candidate_id: number]: any[] } = {};
    for (const interview of interviews) {
      const id = interview.candidate_id;
      if (!grouped[id]) {
        grouped[id] = [];
      }
      grouped[id].push(interview);
    }
    return grouped;
  };

  
  // Calculate vote totals and checkbox state
  useEffect(() => {
    if (!user || !interviews.length) return;
  
    const grouped = groupInterviewsByCandidate(interviews);
    const voteData: { [key: number]: VoteData } = {};
    const checkboxData: { [key: number]: boolean } = {};
  
    for (const [candidateIdStr, candidateInterviews] of Object.entries(grouped)) {
      const candidateId = parseInt(candidateIdStr);
      voteData[candidateId] = { Overall: 0, Profesionality: 0, Quality: 0, Personality: 0 };
  
      candidateInterviews.forEach((interview) => {
        voteData[candidateId].Overall += interview.question1;
        voteData[candidateId].Profesionality += interview.question2;
        voteData[candidateId].Quality += interview.question3;
        voteData[candidateId].Personality += interview.question4;
        // You can use OR logic so if any vote has checked=true, it's selected
        checkboxData[candidateId] = checkboxData[candidateId] || interview.checked;
      });
    }
  
    setVoteCounts(voteData);
    setCheckedState(checkboxData);
  }, [interviews, user]);
  

  useEffect(() => {
    if (!interviews.length || !candidates.length) return;
  
    const uniqueCandidateIds = [...new Set(interviews.map((i) => i.candidate_id))];
  
    const merged = uniqueCandidateIds.map((id) => {
      const candidate = candidates.find((c) => c.id === id);
      const resume = resumes.find((r) => r.id === candidate?.resume_id);
      return {
        candidate_id: id,
        video_path: candidate?.interview || "https://www.youtube.com/embed/srw4r3htm4U",
        resume_path: resume?.file_path || 'uploads/resumes/sample1.pdf',
      };
    });
  
    setInterviewsWithVideos(merged);
  }, [interviews, candidates]);
  

  // Setup socket.io
  useEffect(() => {
    if (!user || socket) return;

    socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      socket?.emit("joinGroup", user.group_id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("checkboxUpdated", ({ interview_number, checked }: { interview_number: number; checked: boolean }) => {
      setCheckedState((prev) => ({ ...prev, [interview_number]: checked }));
    });

    return () => {
      socket?.off("checkboxUpdated");
    };
  }, [user]);

  const handleCheckboxChange = (interviewNumber: number) => {
    if (!socket || !isConnected) return;

    const newCheckedState = !checkedState[interviewNumber];
    setCheckedState((prev) => ({ ...prev, [interviewNumber]: newCheckedState }));

    socket.emit("checkint", {
      group_id: user.group_id,
      interview_number: interviewNumber,
      checked: newCheckedState,
    });
  };

  const completeInterview = () => {
    const selectedCount = Object.values(checkedState).filter(Boolean).length;
    if (selectedCount !== 1) {
      alert("You must select exactly 1 candidates before proceeding.");
      return;
    }
    localStorage.setItem("progress", "interview-stage");
    window.location.href = "/dashboard";
  };

  const selectedCount = Object.values(checkedState).filter(Boolean).length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  if (!user || user.affiliation !== "student") return null;

  return (
    <div className="min-h-screen bg-sand font-rubik">
      <Navbar />
      <div className="flex items-right justify-end">
        <NotesPage />
      </div>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center text-navy mb-6">
          Make an Offer as a Group
        </h1>
        <h2 className="text-xl italic text-center text-navy mb-6">
          Please review the Candidates below and as a group select 1 to give an offer.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviewsWithVideos.map((interview, index) => {
            const interviewNumber = interview.candidate_id;
            const votes = voteCounts[interviewNumber];

            return (
              <div key={interviewNumber} className="bg-wood p-6 rounded-lg shadow-md flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-navy text-center">
                  Candidate {interviewNumber}
                </h3>
            
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-lg shadow-md"
                    src={interview.video_path}
                    title="Interview Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
            
                <div className="mt-2 space-y-1 text-navy text-sm">
                  <p><span className="font-medium">Overall:</span> {votes.Overall}</p>
                  <p><span className="font-medium">Professional Presence:</span> {votes.Profesionality}</p>
                  <p><span className="font-medium">Quality of Answer:</span> {votes.Quality}</p>
                  <p><span className="font-medium">Personality:</span> {votes.Personality}</p>
                </div>

                <a
                  href={`${API_BASE_URL}/${interview.resume_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy hover:underline"
                >
                  View / Download Resume
                </a>
            
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={checkedState[interviewNumber] || false}
                    onChange={() => handleCheckboxChange(interviewNumber)}
                    className="h-4 w-4 text-navyHeader"
                  />
                  <span className="ml-2 text-navy text-sm">Selected for Offer</span>
                </label>
              </div>
            );            
          })}
        </div>

        <footer className="flex justify-between mt-6">
          <button
            onClick={() => (window.location.href = "/jobdes")}
            className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-blue-400 transition duration-300 font-rubik"
          >
            ← Back: Job Description
          </button>
          <button
            onClick={completeInterview}
            disabled={selectedCount !== 1}
            className={`px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md font-rubik transition duration-300 ${
              selectedCount !== 1 ? "cursor-not-allowed opacity-50" : "hover:bg-blue-400"
            }`}
          >
            Next: Dashboard →
          </button>
        </footer>
      </div>
      <Footer />
    </div>
  );
}

