import React, { useState } from "react";
import Filter from "./components/Filter";

export const languages = [
  "Identify Language",
  "English",
  "Finnish",
  "Swedish",
  "German",
  "Korean",
  "Japanese",
  "Chinese",
  "Arabic",
  "French",
  "Kurdish",
  "Kazakh"
];

function App() {
  const [selected, setSelected] = useState("English");

  return (
    <div>
      <h2>Choose a Language</h2>
      <Filter 
        data={languages}
        selected={selected}
        onSelected={(selection) => setSelected(selection)}
      />
    </div>
  );
}

export default App;
