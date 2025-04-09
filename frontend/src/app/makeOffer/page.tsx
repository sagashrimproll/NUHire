"use client";
const API_BASE_URL= process.env.NEXT_PUBLIC_API_BASE_URL;

import { io, Socket } from "socket.io-client";
import Navbar from "../components/navbar";
import { useProgress } from "../components/useProgress";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NotesPage from "../components/note";
import router from "next/router";

const SOCKET_URL = `${API_BASE_URL}`; 
let socket: Socket | null = null; // Define socket with correct type

export default function MakeOffer() {
  useProgress();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [checkedState, setCheckedState] = useState<{ [key: number]: boolean }>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const pathname = usePathname();
  const [popup, setPopup] = useState<{headline: string; message: string} | null>(null)

  interface User {
    id: string;
    group_id: string;
    email: string;
  }

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
  
          // socket.on("checkboxUpdated", ({ resume_number, checked }: { resume_number: number; checked: boolean }) => {
          //     setCheckedState((prev) => ({
          //         ...prev,
          //         [resume_number]: checked,
          //     }));
          // });
  
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

      useEffect(() => {
        if (user && user.email) {
          socket.emit("studentOnline", { studentId: user.email });
    
          socket.emit("studentPageChanged", {
            studentId: user.email,
            currentPage: pathname,
          });
    
          const updateCurrentPage = async () => {
            try {
              await fetch("http://localhost:5001/update-currentpage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  page: "interviewpage",
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
    
      useEffect(() => {
        socket?.on("receivePopup", ({ headline, message }) => {
          setPopup({ headline, message });
        });
        return () => {
          socket.off("receivePopup");
        };
      }, []);
    
      const completeMakeOffer = () => {
        localStorage.setItem("progress", "employerPannel");
        window.location.href = "/employerPannel";
      };

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
          Interview Review as a Group
        </h1>
        <h2 className="text-xl italic text-center text-navy mb-6">
          Please review the candidates that you have just interviewed and select
          1 to make offers to.
        </h2>
      </div>

      <h1> Make an Offer here </h1>

      <button onClick={completeMakeOffer}>
        Next: What would an Employer Do?{" "}
      </button>
    </div>
  );
}
