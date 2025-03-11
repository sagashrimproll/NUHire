"use client";
import React, { useState, useEffect } from "react";

const NotesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  
    useEffect(() => {
      const fetchUserEmail = async () => {
        try {
          const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
          const userData = await response.json();
          if (response.ok) {
            setUserEmail(userData.email);
          } else {
            console.error("Error fetching user");
          }
          console.log(userData.email);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
  
      fetchUserEmail();
    }, []);

  
  useEffect(() => {
    if (!userEmail) return;

    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5001/notes", {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch notes");

        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchNotes();
  }, [userEmail]);

  const saveNote = async () => {
    if (!note.trim()) return;

    try {
      const response = await fetch("http://localhost:5001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({user_email: userEmail, content: note }),
      });

      if (!response.ok) throw new Error("Failed to save note:", userEmail);

      const newNote = await response.json();
      setNotes([...notes, newNote]);
      setNote(""); // Clear input
      window.location.reload();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div className="relative p-4">
  {/* Toggle Notes Button */}
  <button
    className="bg-wood text-navy px-4 py-2 rounded-md hover:bg-sand border-4 border-navy transition"
    onClick={() => setIsOpen(!isOpen)}
  >
    ☰ Notes
  </button>

  {isOpen && (
    <div className="absolute top-14 right-4 w-80 bg-sand shadow-lg rounded-lg p-4 border border-gray-300">
      {/* Note Input Section */}
      <div className="mb-4">
        <textarea
          placeholder="Enter your notes..."
          className="w-full p-2 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          onClick={saveNote}
          className="mt-2 w-full bg-wood border-4 border-navy text-navy py-2 rounded-md hover:bg-sand transition"
        >
          Save Note
        </button>
      </div>

      {/* Display Saved Notes */}
      <div className="mt-4">
        <h2 className="font-bold text-navy">Saved Notes:</h2>
        <div className="max-h-[50vh] overflow-y-auto">
          {notes.length > 0 ? (
            notes.map((n) => (
              <p key={n.id} className="p-2 mt-2 border border-gray-200 rounded-md bg-springWater">
          {n.content}
              </p>
            ))
          ) : (
            <p className="text-navy mt-2">No notes found.</p>
          )}
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default NotesPage;
