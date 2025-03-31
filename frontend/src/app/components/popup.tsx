"use client";

import React from "react";

interface PopupProps {
  headline: string;
  message: string;
  onDismiss: () => void;
}

const Popup = ({ headline, message, onDismiss }: PopupProps) => {

  return (
    <div className="fixed top-10 right-10 bg-springWater p-4 rounded-md shadow-lg">
      <h2 className="font-bold text-navyHeader">{headline}</h2>
      <p className="text-navy">{message}</p>
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