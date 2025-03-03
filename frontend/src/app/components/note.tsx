"use client";

import React, { useState, useEffect } from "react";

const NotesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const userEmail = "testuser@example.com"; // Replace with actual user email from authentication

  // Fetch saved notes on component load
  useEffect(() => {
    fetch(`http://localhost:5001/notes/${userEmail}`)
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, []);

  // Save a new note
  const saveNote = async () => {
    if (!note.trim()) return;

    const response = await fetch("http://localhost:5001/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, noteContent: note }),
    });

    if (response.ok) {
      const newNote = await response.json();
      setNotes([...notes, { id: newNote.id, content: note }]); // Update UI
      setNote(""); // Clear input
    }
  };

  return (
    <div className="relative p-4">
      {/* Button to toggle notes */}
      <button 
        className="p-2 bg-gray-800 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰ Notes
      </button>

      {/* Dropdown for notes */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg p-4">
          <textarea
            placeholder="Enter your notes..."
            className="w-full h-40 p-2 border rounded-md"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            onClick={saveNote}
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
          >
            Save Note
          </button>
        </div>
      )}

    </div>
  );
};

export default NotesPage;

