import React, { useState } from "react";
import "./MoodPicker.css";

const MoodPicker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState("");

  return (
    <div className="MoodPicker">
      <label htmlFor="Mood-select" className="label">
        Choose mood:
      </label>

      <select
        id="mood-select"
        className="select"
        value={selectedMood}
        onChange={(e) => setSelectedMood(e.target.value)}
      >
        <option value="">Select Mood</option>
        <option value="">Happy</option>
        <option value="">Upset</option>
        <option value="">Sad</option>
        <option value="">Flustered</option>
        <option value="">Calm</option>
        <option value="">Excited</option>
      </select>

      {selectedMood && (
        <p className="result">
          Selected: {selectedMood}
        </p>
      )}
    </div>
  );
};

export default MoodPicker;