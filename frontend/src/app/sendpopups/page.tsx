"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import NavbarAdmin from "../components/navbar-admin";
import {io} from "socket.io-client";

const socket = io("http://localhost:5001");



const SendPopups = () => {  
    interface User {
        affiliation: string;
    }

    interface Group {
        group_id: string;
        students: string[];
    }

    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [headline, setHeadline] = useState("");
    const [message, setMessage] = useState(""); 
    const [sending, setSending] = useState(false); // Track API request state
    const [selectedPreset, setSelectedPreset] = useState<string>(""); 
    const router = useRouter(); 
    const [isConnected, setIsConntected] = useState(false); // Track WebSocket connection state
    
    const presetPopups = [
        {title: "Internal Refferal", headline: "Internal Referral", message: "This person has an internal referral for this position! You have to accept this candidate!"},
        {title: "No Show", headline: "Abandoned Interview", message: "This candidate did not show up for the interview."}
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
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
        const fetchGroups = async () => {
            try {
                const response = await fetch("http://localhost:5001/groups");
                const data = await response.json();
                setGroups(data);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };

        fetchGroups();
    }, []);

    if (loading) return <p>Loading...</p>;

    if (!user || user.affiliation !== "admin") {
        return <div>This account is not authorized to access this page. Please log in with an admin account.</div>;
    }

    const handleCheckboxChange = (groupId: string) => {
        setSelectedGroups((prevSelected) =>
            prevSelected.includes(groupId)
                ? prevSelected.filter((id) => id !== groupId)
                : [...prevSelected, groupId]
        );
    }; 
    

    const handlePresetSelection = (presetTitle: string) => {
        setSelectedPreset(presetTitle);
        const preset = presetPopups.find((p) => p.title === presetTitle);
        if (preset) {
            setHeadline(preset.headline);
            setMessage(preset.message);
        }
    };

    const sendPopups = async () => {
      if (!headline || !message || selectedGroups.length === 0) {
          alert("Please enter a headline, message, and select at least one group.");
          return;
      }
  
      setSending(true);
  
      try {
          socket.emit("sendPopupToGroups", {
              groups: selectedGroups,
              headline,
              message,
          });
  
          alert("Popups sent successfully!");
          
          setHeadline("");
          setMessage("");
          setSelectedGroups([]);
          setSelectedPreset("");
      } catch (error) {
          console.error("Error sending popups:", error);
          alert("Failed to send popups. Please try again.");
      } finally {
          setSending(false); 
      }
  };


    return (
      <div className="flex flex-col min-h-screen bg-sand font-rubik">
        <NavbarAdmin />

        <div className="max-w-3xl mx-auto justify-center items-center p-6 mt-6">
          <h1 className="text-3xl font-bold text-center text-navyHeader mb-6">
            Send Popups
          </h1>

          <p className="text-lg text-center text-navyHeader mb-4">
            Select a preset or create a custom message to send to selected groups of students.
          </p>

          <div className="mb-6">
            <label className="text-lg font-rubik block mb-2">Choose a Preset:</label>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetSelection(e.target.value)}
              className="w-full p-3 border border-wood bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Preset --</option>
              {presetPopups.map((preset) => (
                <option key={preset.title} value={preset.title}>
                  {preset.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <label className="text-lg font-rubik">Headline:</label>
            <input
              type="text"
              placeholder="Enter subject for popup"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="p-3 border border-wood text-left bg-springWater rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-lg"
            />
          </div>

          <div className="flex gap-4 mb-6">
            <label className="text-lg font-rubik">Content: </label>
            <textarea
              placeholder="Enter your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-[600px] max-w-1xl h-32 p-4 border border-wood text-left bg-springWater 
                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                mb-4 resize-none overflow-hidden text-lg whitespace-pre-wrap"
              rows={3}
            />
          </div>

          <div className="w-full max-w-2xl bg-navy shadow-lg rounded-lg p-6">
            {groups && Object.keys(groups).length > 0 ? (
              Object.entries(groups).map(([group_id, students]) => (
                <div
                  key={group_id}
                  className="bg-springWater mb-4 p-4 border rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-navy">
                      Group {group_id}
                    </h3>
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-500 accent-navy cursor-pointer"
                      checked={selectedGroups.includes(group_id)}
                      onChange={() => handleCheckboxChange(group_id)}
                    />
                  </div>

                  <ul className="mt-2 space-y-2">
                    {Array.isArray(students) && students.length > 0 ? (
                      students.map((student, index) => (
                        <li
                          key={index}
                          className="bg-springWater p-3 rounded-md shadow-sm border flex items-center gap-3"
                        >
                          <div className="text-navy font-medium">
                            {student.name}
                            <span className="text-gray-500 text-sm ml-2">
                              ({student.email})
                            </span>
                          </div>
                          <span className="ml-auto text-sm italic text-gray-600">
                            {student.current_page
                              ? `- ${student.current_page}`
                              : ""}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm italic">
                        No Students Added
                      </li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Loading groups...</p>
            )}
          </div>

          <button
            onClick={sendPopups}
            disabled={sending || selectedGroups.length === 0}
            className={`mt-6 px-6 py-3 font-semibold rounded-md transition 
                        ${
                          sending || selectedGroups.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
          >
            {sending ? "Sending..." : "Send Popups"}
          </button>
        </div>
      </div>
    );
};

export default SendPopups;