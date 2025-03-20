"use client";

import React from "react";

interface PopupProps {
  headline: string;
  message: string;
  onDismiss: () => void;
}

const Popup = ({ headline, message, onDismiss }: PopupProps) => {

  return (
    <div className="fixed top-10 right-10 bg-blue-500 text-white p-4 rounded-md shadow-lg">
      <h2 className="font-bold">{headline}</h2>
      <p>{message}</p>
      <button
        onClick={onDismiss}
        className="mt-2 px-4 py-2 bg-gray-800 text-white rounded"
      >
        Dismiss
      </button>
    </div>
  );
};

export default Popup;