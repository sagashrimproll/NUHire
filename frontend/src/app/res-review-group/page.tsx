'use client';
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { useProgress } from "../components/useProgress";

const SOCKET_URL = "http://localhost:5001"; 
let socket; // Declare socket without immediately connecting

const resumesList = [
    "/test-resumes/sample1.pdf",
    "/test-resumes/sample2.pdf",
    "/test-resumes/sample3.pdf",
    "/test-resumes/sample4.pdf",
    "/test-resumes/sample5.pdf",
    "/test-resumes/sample6.pdf",
    "/test-resumes/sample7.pdf",
    "/test-resumes/sample8.pdf",
    "/test-resumes/sample9.pdf",
    "/test-resumes/sample10.pdf"
];

export default function ResReviewGroup() {
    useProgress();

    const [checkedState, setCheckedState] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Fetch user authentication data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
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
            }
        };

        fetchUser();
    }, [router]);

    // Fetch initial checkbox states from the database
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user) return;

                const response = await fetch(`http://localhost:5001/resume/${user.group_id}`);
                const data = await response.json();

                const checkData = {};
                data.forEach((resume) => {
                    checkData[resume.resume_number] = resume.checked || false;
                });

                setCheckedState(checkData);
            } catch (error) {
                console.error("Error fetching resume checkbox states:", error);
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
            socket.emit("joinGroup", user.group_id);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("checkboxUpdated", ({ resume_number, checked }) => {
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
    const handleCheckboxChange = (resumeNumber) => {
        if (!socket || !isConnected) {
            console.warn("Socket not connected. Checkbox state not sent.");
            return;
        }

        const newCheckedState = !checkedState[resumeNumber];

        // Optimistically update the state
        setCheckedState((prev) => ({
            ...prev,
            [resumeNumber]: newCheckedState,
        }));

        // Emit checkbox update to the server
        socket.emit("check", {
            group_id: user.group_id,
            resume_number: resumeNumber,
            checked: newCheckedState,
        });
    };

    return (
        <div className="min-h-screen bg-sand font-rubik">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-center text-navy mb-6">
                    Resume Review as a Group
                </h1>
                {isConnected ? (
                    <p className="text-center text-green-600 mb-8">Connected to server</p>
                ) : (
                    <p className="text-center text-red-600 mb-8">Not connected to server</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumesList.map((resumePath, index) => {
                        const resumeNumber = index + 1;
                        return (
                            <div key={resumeNumber} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    Resume {resumeNumber}
                                </h3>
                                <a
                                    href={resumePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    View / Download Resume
                                </a>

                                <label className="flex items-center mt-4">
                                    <input
                                        type="checkbox"
                                        checked={checkedState[resumeNumber] || false}
                                        onChange={() => handleCheckboxChange(resumeNumber)}
                                    />
                                    <span className="ml-2">Selected for Further Review</span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
