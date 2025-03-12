"use client";
import React, { useState, useEffect } from "react";

const NotesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  interface Note {
    id: string;
    content: string;
  }

  const [notes, setNotes] = useState<Note[]>([]);
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

      if (!response.ok) throw new Error(`Failed to save note: ${userEmail}`);

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
      <button
        className="notes"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰ Notes
      </button>

      {isOpen && (
        <div className="notearea">
          <div className="writenote">
          <textarea
            placeholder="Enter your notes..."
            className="textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            onClick={saveNote}
            className="savebutton"
          >
            Save Note
          </button>
          </div>

          <div className="saved-notes">
            <h2 className="font-bold">Saved Notes:</h2>
            {notes.length > 0 ? (
            notes.map((n) => (
            <p key={n.id} className="p-2 border mt-2">{n.content}</p>
            ))
           ) : (
          <p className="text-gray-500">No notes found.</p>
        )}
      </div>
        </div>
      )}

    </div>
  );
};

export default NotesPage;
