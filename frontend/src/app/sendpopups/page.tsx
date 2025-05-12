"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavbarAdmin from "../components/navbar-admin";
import { io } from "socket.io-client";
import Popup from "../components/popup";

const socket = io(`${API_BASE_URL}`);

const SendPopups = () => {
  interface User {
    affiliation: string;
  }

    interface Group {
        group_id: string;
        students: any[];
    }
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<Record<string, any>>({});
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [headline, setHeadline] = useState("");
    const [message, setMessage] = useState(""); 
    const [sending, setSending] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [classes, setClasses] = useState<{id: number, name: string}[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const router = useRouter(); 
    const [isConnected, setIsConntected] = useState(false);
    const [pendingOffers, setPendingOffers] = useState<
    { classId: number; groupId: number; candidateId: number }[]
  >([]);
    
  const presetPopups = [
    {
      title: "Internal Referral",
      headline: "Internal Referral",
      message:
        "This person has an internal referral for this position! You have to accept this candidate!",
    },
    {
      title: "No Show",
      headline: "Abandoned Interview",
      message:
        "This candidate did not show up for the interview. You can change the scores, but everything will be saved as the lowest score.",
    },
  ];

    // Fetch the logged-in user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" });
                const userData = await response.json();

                if (response.ok) {
                    setUser(userData);
                } else {
                    setUser(null);
                    router.push("/");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

    fetchUser();
  }, [router]);

    // Fetch available classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/classes`);
                const data = await response.json();
                setClasses(data);
                if (data.length > 0) {
                    setSelectedClass(data[0].id.toString());
                }
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };

        fetchClasses();
    }, []);

    // Fetch groups filtered by class
    useEffect(() => {
        const fetchGroups = async () => {
            if (!selectedClass) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/groups?class=${selectedClass}`);
                const data = await response.json();
                setGroups(data);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };

        if (selectedClass) {
        fetchGroups();
        }
  }, [selectedClass]);

  useEffect(() => {
    const onRequest = (data: { classId: number; groupId: number; candidateId: number }) => {
      const { classId, groupId, candidateId } = data;
      setPendingOffers((prev) => [...prev, {classId, groupId, candidateId }]);
    };
  
    socket.on("makeOfferRequest", onRequest);
    return () => {
      socket.off("makeOfferRequest", onRequest);
    };
  }, []);

  if (loading) return <p>Loading...</p>;

    if (!user || user.affiliation !== "admin") {
        return <div>This account is not authorized to access this page. Please log in with an admin account.</div>;
    }

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClass(e.target.value);
        setSelectedGroups([]); // Reset selected groups when class changes
    };

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

  const respondToOffer = (
    classId: number,
    groupId: number,
    candidateId: number,
    accepted: boolean
  ) => {
    socket.emit("makeOfferResponse", {
      classId: selectedClass,
      groupId,
      candidateId,
      accepted,
    });
    setPendingOffers((prev) =>
      prev.filter((o) => o.classId != classId || o.groupId !== groupId || o.candidateId !== candidateId)
    );
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
                class: selectedClass // Add class information
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
          Select a preset or create a custom message to send to selected groups
          of students.
        </p>

          {/* Class Selection Dropdown */}
          <div className="mb-6">
            <label className="text-lg font-rubik block mb-2">Select Class:</label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full p-3 border border-wood bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Class --</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <>
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
                <h2 className="text-xl font-bold text-sand mb-4">
                  Groups in Class {selectedClass}
                </h2>
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
                  <p className="text-sand text-center">No groups found in this class.</p>
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

        {pendingOffers.map(({classId, groupId, candidateId }) => (
          <div
            key={`offer-${classId}-${groupId}-${candidateId}`}
            className="mt-6 p-4 bg-springWater rounded-md shadow-md max-w-md mx-auto"
          >
            <Popup
              headline={`Group ${groupId} from Class ${classId} wants to offer Candidate ${candidateId}`}
              message="Do you approve?"
              onDismiss={() =>
                setPendingOffers((prev) =>
                  prev.filter(
                    (o) =>
                      o.groupId !== groupId || o.candidateId !== candidateId
                  )
                )
              }
            />

            <div className="mt-2 flex justify-between">
              <button
                onClick={() => respondToOffer(classId, groupId, candidateId, false)}
                className="px-4 py-2 rounded-md bg-red-200 text-red-800 hover:bg-red-300 transition"
              >
                Reject
              </button>
              <button
                onClick={() => respondToOffer(classId, groupId, candidateId, true)}
                className="px-4 py-2 rounded-md bg-green-200 text-green-800 hover:bg-green-300 transition"
              >
                Accept
              </button>
            </div>
          </div>
        ))}
      </>
    )}

      </div>
    </div>
  );
};

export default SendPopups;
