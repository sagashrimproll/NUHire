"use client";

import React, { useState } from 'react';
import { useCollapse } from 'react-collapsed';
import axios from 'axios';
import Navbar from '../components/navbar';

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const response = await axios.post('/api/notes', { note: newNote });
        if (response.status === 201) {
          setNotes([...notes, newNote]);
          setNewNote('');
        }
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  // Notes page allows user to take and save notes that sustain throughout the application
  return (
    <div>
        <Navbar/>
      <h1>Notes</h1>
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
        <ul>
          {notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotesPage;