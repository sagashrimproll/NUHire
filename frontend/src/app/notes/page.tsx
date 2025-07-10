"use client";

import React, { useState, useEffect } from 'react';
import { useCollapse } from 'react-collapsed';
import axios from 'axios';
import Navbar from '../components/navbar';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NotesPage: React.FC = () => {
  const router = useRouter();
  
  interface Note {
    id: number;
    user_email: string;
    content: string;
    created_at: string;
  }

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  interface User {
      id: string;
      group_id: string;
      email: string;
      class: number;
      affiliation: string;
  }


  const [user, setUser] = useState<User | null>(null);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notes`);
      if (response.status === 200) {
        console.log('Notes fetched:', response.data);
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() && user && user.email) { 
      try {
        const response = await axios.post(`${API_BASE_URL}/notes`, { 
          user_email: user.email, 
          content: newNote 
        });
        if (response.status === 201) {
          // Refresh the notes list after adding
          await fetchNotes();
          setNewNote('');
        }
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  // Load user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
          credentials: "include",
        });
        const userData = await response.json();
        if (response.ok) {
          setUser(userData);
          // Fetch existing notes after user is loaded
          await fetchNotes();
        }
        else router.push("/login");
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  

  return (
    <div>
        <Navbar/>
      <h1>Notes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div {...getToggleProps()}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </div>
          <div {...getCollapseProps()}>
            <div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your note here..."
              />
              <button onClick={handleAddNote}>Add Note</button>
            </div>
            <div>
              <h2>All Notes ({notes.length})</h2>
              {notes.length === 0 ? (
                <p>No notes found. Add your first note above!</p>
              ) : (
                <ul>
                  {notes.map((note) => (
                    <li key={note.id}>
                      <p>{note.content}</p>
                      <small>Created at {new Date(note.created_at).toLocaleDateString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotesPage;