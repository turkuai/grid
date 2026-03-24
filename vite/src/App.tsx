import { useState } from "react";
import Filter from "./components/Filter";
import { languages } from "./components/List";

function App() {
  // valitsee ensimmäisen tuloksen/kielen
  const [selected, setSelected] = useState<string>("Identify Language");

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Choose a Language</h2>
      <Filter 
        data={languages} 
        selected={selected} 
        onSelected={(setSelected)}
      />
    </div>
  );
}

export default App;