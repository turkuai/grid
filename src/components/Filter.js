import React, { useState } from "react";
import { languages, List } from "./List.js";
import "./Filter.css";

function Filter() {
  const [query, setQuery] = useState("");

  const filteredItems = languages
    .filter(lang => lang.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const q = query.toLowerCase();
      const aStarts = a.toLowerCase().startsWith(q);
      const bStarts = b.toLowerCase().startsWith(q);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });

  return (
    <div className="filter-container">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <List items={filteredItems} query={query} />
    </div>
  );
}

export default Filter;