import React, { useState } from "react";
import "./MoodPicker.css";

const MoodPicker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState("");

  return (
    <div className="MoodPicker">
      <label htmlFor="mood-select" className="label">
        Choose mood:
      </label>

      <select
        id="mood-select"
        className="select"
        value={selectedMood}
        onChange={(e) => setSelectedMood(e.target.value)}
      >
        <option value="">Select Mood</option>
        <option value="happy">Happy</option>
        <option value="upset">Upset</option>
        <option value="sad">Sad</option>
        <option value="flustered">Flustered</option>
        <option value="calm">Calm</option>
        <option value="excited">Excited</option>
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