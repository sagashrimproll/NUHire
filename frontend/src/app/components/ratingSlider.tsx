"use client";

import React, { useState } from "react";

/**
 * Props:
 * - onChange?: function to handle changes in the slider's value
 */
interface RatingSliderProps {
  onChange?: (value: number) => void;
}

export default function RatingSlider({ onChange }: RatingSliderProps) {
  const [value, setValue] = useState<number>(5); // default to 5

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl">
      <div className="flex flex-row justify-between w-full text-xl mb-2">
        {[...Array(10)].map((_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>

      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={handleChange}
        className="slider w-full h-3 accent-blue-500 cursor-pointer"
        style={{ cursor: "pointer" }} 
      />

      <p className="mt-2 text-sm">Selected Value: {value}</p>
    </div>
  );
}