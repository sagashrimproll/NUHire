"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import React, { useState, useEffect, use } from "react";
import { io, Socket } from "socket.io-client";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { useProgress } from "../components/useProgress";
import NotesPage from "../components/note";
import Footer from "../components/footer";

const SOCKET_URL = `${API_BASE_URL}`; 
let socket: Socket | null = null; // Define socket with correct type

export default function makeOffer() {
    useProgress();

    const [checkedState, setCheckedState] = useState<{ [key: number]: boolean }>({});
    const [voteCounts, setVoteCounts] = useState<{ [key: number]: VoteData }>({});
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [user, setUser] = useState(null);
    const [resumes, setResumes] =  useState([]);
    const [interviewVids, setInterviewVids] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [canidates, setCanidates] = useState([]);
    const router = useRouter();

    // Fetch user authentication data
    useEffect(() => {
        const fetchUser = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" });
            const userData = await response.json();
    
            if (response.ok) {
              setUser(userData);
            } else {
              setUser(null);
              router.push("/login"); // Redirect to login if unauthorized
            }
          } catch (error) {
            console.error("Error fetching user:", error);
            router.push("/login"); // Redirect on error
          } finally {
            setLoading(false);
          }
        };
    
        fetchUser();
    }, [router]);
    
    const fetchCandidatesByIds = async (candidateIds: number[]) => {
      try {
        const response = await fetch(`${API_BASE_URL}/canidates`);
        const allCandidates = await response.json();
    
        // Filter only candidates whose ID is in the interviews
        const filtered = allCandidates.filter((c: any) => candidateIds.includes(c.id));
        setCanidates(filtered);
      } catch (error) {
        console.error("Error fetching filtered candidates:", error);
      }
    };
    
    //get interview page responses from users group
    useEffect(() => {
      const fetchInterviews = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/interview/group/${user?.group_id}`);
          const data = await response.json();
          setInterviews(data);
    
          // Step 2: Extract unique candidate IDs
          const uniqueCandidateIds = Array.from(new Set(data.map((item: any) => item.candidate_id)));
    
          // Step 3: Fetch candidates by filtering later
          fetchCandidatesByIds(uniqueCandidateIds);
        } catch (error) {
          console.error("Error fetching interviews:", error);
        }
      };
    
      if (user?.group_id) {
        fetchInterviews();
      }
    }, [user?.group_id]);
    

    // 1. Fetch all resumes first
  useEffect(() => {
  const fetchResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/canidate/resumes`);
      const data = await response.json();
      setResumes(data); // all resumes stored here
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  fetchResumes();
  }, []);

  // 2. Filter resumes for only the selected candidates
useEffect(() => {
  if (canidates.length === 0 || resumes.length === 0) return;

  // Extract resume IDs from candidates
  const candidateResumeIds = canidates
    .map((c: any) => c.resume_id)
    .filter((id: number | null) => id !== null);

  // Filter resumes that match candidate resume IDs
  const filteredResumes = resumes.filter((r: any) =>
    candidateResumeIds.includes(r.id)
  );

  setResumes(filteredResumes); // Override with just the ones you need
}, [canidates, resumes]);


     // 1. Fetch all resumes first
     useEffect(() => {
      const fetchInterviewvids = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/interview-vids`);
          const data = await response.json();
          setInterviewVids(data); // all resumes stored here
        } catch (error) {
          console.error("Error fetching resumes:", error);
        }
      };
    
      fetchInterviewvids();
      }, []);
    
      // 2. Filter resumes for only the selected candidates
    useEffect(() => {
      if (canidates.length === 0 || interviewVids.length === 0) return;
    
      // Extract resume IDs from candidates
      const candidateinterviewIds = canidates
        .map((c: any) => c.interview)
        .filter((id: number | null) => id !== null);
    
      // Filter resumes that match candidate resume IDs
      const filteredInterviews= interviewVids.filter((r: any) =>
        candidateinterviewIds.includes(r.id)
      );
    
      setInterviewVids(filteredInterviews); // Override with just the ones you need
    }, [canidates, interviewVids]);

    useEffect(() => {
    const fetchData = async () => {
        try {
            if (!user) return;
    
            const response = await fetch(`${API_BASE_URL}/interview/group/${user.group_id}`);
            const data: InterviewData[] = await response.json();
    
            const voteData: { [key: number]: VoteData } = {};
            const checkboxData: { [key: number]: boolean } = {};  // New state tracking checkboxes
    
            data.forEach((interview) => {
                const { interview_number, q1, q2, q3, q4, checked } = interview;
    
                if (!voteData[interview_number]) {
                    voteData[interview_number] = { Overall: 0, Profesionality: 0, Quality: 0, Personality: 0 };
                }
    
                voteData[interview_number].Overall += q1;
                voteData[interview_number].Profesionality += q2; 
                voteData[interview_number].Quality += q3;
                voteData[interview_number].Personality += q4;
    
                checkboxData[interview_number] = checked;  // Store checkbox state
            });
    
            setVoteCounts(voteData);
            setCheckedState(checkboxData);  // Load checkboxes
        } catch (error) {
            console.error("Error fetching interview data:", error);
        }
       };
        if (user) {
            fetchData();
        }
    }, [user]);

    // Setup Socket.IO connection after user authentication
    useEffect(() => {
        if (!user || socket) return; // Prevent reconnecting if socket already exists

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
            setCheckedState((prev) => ({
                ...prev,
                [interview_number]: checked,
            }));
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });

        socket.on("reconnect_failed", () => {
            console.error("Socket reconnection failed.");
        });

        return () => {
            if (socket) {
                socket.off("checkboxUpdated");
            }
        };
    }, [user]);

    // Handle checkbox toggle
    const handleCheckboxChange = (interviewNumber: number) => {
        if (!socket || !isConnected) {
            console.warn("Socket not connected. Checkbox state not sent.");
            return;
        }
    
        const newCheckedState = !checkedState[interviewNumber];
    
        console.log(`Sending checkbox update: Resume ${interviewNumber}, Checked: ${newCheckedState}`);
    
        setCheckedState((prev) => ({
            ...prev,
            [interviewNumber]: newCheckedState,
        }));
    
        socket.emit("checkint", {
            group_id: user?.group_id,
            interview_number: interviewNumber,
            checked: newCheckedState,
        });
    };
    
    useEffect(() => {
        if (!socket) return;
    
        socket.on("checkboxUpdated", ({ interview_number, checked }) => {
            console.log(`Received checkbox update: Resume ${interview_number}, Checked: ${checked}`);
    
            setCheckedState((prev) => ({
                ...prev,
                [interview_number]: checked,
            }));
        });
    
        return () => {
            socket.off("checkboxUpdated");
        };
    }, []);
    
    const completeInterview = () => {
        const selectedCount = Object.values(checkedState).filter((checked) => checked).length;
        if (selectedCount !== 1) {
            alert("You must select exactly 1 Interview before proceeding.");
            return;
        }
        localStorage.setItem("progress", "interview-stage");
        window.location.href = "/dashboard"; 
    };
    
    // Calculate selected resume count
    const selectedCount = Object.values(checkedState).filter((checked) => checked).length;

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
    }
    
    if (!user || user.affiliation !== "student") {
        return null;
    }
    
    return (
        <div className="min-h-screen bg-sand font-rubik">
            <Navbar />
            <div className="flex items-right justify-end">
                <NotesPage />
            </div>
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-center text-navy mb-6">
                    Resume Review as a Group
                </h1>
                <h2 className = "text-xl italic text-center text-navy mb-6">
                    Please review the resumes below and as a group select 4 to move on to the next stage.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviews.map((interview, index) => {
                        const interviewNumber = index + 1;
                        const votes = voteCounts[interviewNumber] || { Overall: 0, Profesionality: 0, Quality: 0, Personality: 0 };
                        return (
                            <div key={interviewNumber} className="bg-wood p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-navy mb-2">
                                    Canidate {interviewNumber}
                                </h3>
                                <iframe
                                  className="w-full h-full rounded-lg shadow-lg"
                                  src={interview.video_path}
                                  title="Job Interview Simulation and Training - Mock Interview"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  referrerPolicy="strict-origin-when-cross-origin"
                                  allowFullScreen
                                ></iframe>

                                <div className="mt-4">
                                    <p className="text-navy">Overall: {votes.Overall}</p>
                                    <p className="text-navy">Professional Presence: {votes.Profesionality}</p>
                                    <p className="text-navy">Quality of Answer: {votes.Quality}</p>
                                    <p className="text-navy">Personality: {votes.Personality}</p>
                                </div>

                                <label className="flex items-center mt-4">
                                    <input
                                        type="checkbox"
                                        checked={checkedState[interviewNumber] || false}
                                        onChange={() => handleCheckboxChange(interviewNumber)}
                                    />
                                    <span className="ml-2 text-navy">Selected for Offer</span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
            <footer>
          <div className="flex justify-between mb-4">
            <button
              onClick={() => (window.location.href = "/jobdes")}
              className="px-4 py-2 bg-navyHeader text-white rounded-lg ml-4 shadow-md hover:bg-blue-400 transition duration-300 font-rubik"
            >
              ← Back: Job Description
            </button>
            <button
                onClick={completeInterview}
                 className={`px-4 py-2 bg-navyHeader text-white rounded-lg mr-4 shadow-md transition duration-300 font-rubik
                 ${selectedCount !== 4 ? "cursor-not-allowed opacity-50" : "hover:bg-blue-400"}`}
                disabled={selectedCount !== 4}
            >
                Next: Dashboard →
            </button>

          </div>
        </footer>

        <Footer />
      </div>
    );
}
