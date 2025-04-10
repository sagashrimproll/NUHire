"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { useProgress } from "../components/useProgress";
import NotesPage from "../components/note";
import Footer from "../components/footer";

const SOCKET_URL = `${API_BASE_URL}`; 
let socket: Socket; // Define socket with correct type

export default function ResReviewGroup() {
    useProgress();

    const [checkedState, setCheckedState] = useState<{ [key: number]: boolean }>({});
    const [voteCounts, setVoteCounts] = useState<{ [key: number]: VoteData }>({});
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [user, setUser] = useState(null);
    const [resumes, setResumes] =  useState([]);
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

    const fetchResumes = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/resume_pdf`);
          const data = await response.json();
          setResumes(data);
        } catch (error) {
          console.error("Error fetching resumes:", error);
        }
      };

      useEffect(() => {
        fetchResumes();
      }, []);

    useEffect(() => {
    const fetchData = async () => {
        try {
            if (!user) return;
    
            const response = await fetch(`${API_BASE_URL}/resume/group/${user.group_id}`);
            const data: ResumeData[] = await response.json();
    
            const voteData: { [key: number]: VoteData } = {};
            const checkboxData: { [key: number]: boolean } = {};  // New state tracking checkboxes
    
            data.forEach((resume) => {
                const { resume_number, vote, checked } = resume;
    
                if (!voteData[resume_number]) {
                    voteData[resume_number] = { yes: 0, no: 0, undecided: 0 };
                }
    
                if (vote === "yes") {
                    voteData[resume_number].yes += 1;
                } else if (vote === "no") {
                    voteData[resume_number].no += 1;
                } else if (vote === "unanswered") {
                    voteData[resume_number].undecided += 1;
                }
    
                checkboxData[resume_number] = checked;  // Store checkbox state
            });
    
            setVoteCounts(voteData);
            setCheckedState(checkboxData);  // Load checkboxes
        } catch (error) {
            console.error("Error fetching resume data:", error);
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

        socket.on("checkboxUpdated", ({ resume_number, checked }: { resume_number: number; checked: boolean }) => {
            setCheckedState((prev) => ({
                ...prev,
                [resume_number]: checked,
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
    const handleCheckboxChange = (resumeNumber: number) => {
        if (!socket || !isConnected) {
            console.warn("Socket not connected. Checkbox state not sent.");
            return;
        }
    
        const newCheckedState = !checkedState[resumeNumber];
    
        console.log(`Sending checkbox update: Resume ${resumeNumber}, Checked: ${newCheckedState}`);
    
        setCheckedState((prev) => ({
            ...prev,
            [resumeNumber]: newCheckedState,
        }));
    
        socket.emit("check", {
            group_id: user?.group_id,
            resume_number: resumeNumber,
            checked: newCheckedState,
        });
    };
    
    useEffect(() => {
        if (!socket) return;
    
        socket.on("checkboxUpdated", ({ resume_number, checked }) => {
            console.log(`Received checkbox update: Resume ${resume_number}, Checked: ${checked}`);
    
            setCheckedState((prev) => ({
                ...prev,
                [resume_number]: checked,
            }));
        });
    
        return () => {
            socket.off("checkboxUpdated");
        };
    }, []);
    
    const completeResumes = () => {
        const selectedCount = Object.values(checkedState).filter((checked) => checked).length;
        if (selectedCount !== 4) {
            alert("You must select exactly 4 resumes before proceeding.");
            return;
        }
        localStorage.setItem("progress", "interview-stage")
        window.location.href = "/interview-stage"; 
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
                    {resumes.map((resume, index) => {
                        const resumeNumber = index + 1;
                        const votes = voteCounts[resumeNumber] || { yes: 0, no: 0, undecided: 0 };
                        return (
                            <div key={resumeNumber} className="bg-wood p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-navy mb-2">
                                    Resume {resumeNumber}
                                </h3>
                                <a
                                    href={`${API_BASE_URL}/${resume.file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-navy hover:underline"
                                >
                                    View / Download Resume
                                </a>

                                <div className="mt-4">
                                    <p className="text-green-600">Yes: {votes.yes}</p>
                                    <p className="text-red-600">No: {votes.no}</p>
                                    <p className="text-yellow-600">Undecided: {votes.undecided}</p>
                                </div>

                                <label className="flex items-center mt-4">
                                    <input
                                        type="checkbox"
                                        checked={checkedState[resumeNumber] || false}
                                        onChange={() => handleCheckboxChange(resumeNumber)}
                                    />
                                    <span className="ml-2 text-navy">Selected for Further Review</span>
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
                onClick={completeResumes}
                 className={`px-4 py-2 bg-navyHeader text-white rounded-lg mr-4 shadow-md transition duration-300 font-rubik
                 ${selectedCount !== 4 ? "cursor-not-allowed opacity-50" : "hover:bg-blue-400"}`}
                disabled={selectedCount !== 4}
            >
                Next: Interview Stage →
            </button>

          </div>
        </footer>

        <Footer />
      </div>
    );
}
