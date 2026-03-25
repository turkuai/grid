import React from "react";
import "./List.css";

export function List({ items, query, selected, onSelect }) {
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return ( // highlight/strong haussa olevat kirjaimet
      <>
        {before}
        <strong>{match}</strong>
        {after}
      </>
    );
  };

  return (
    <div className="list">
      {items.map((item, index) => (
        <button
          key={index}
          className={`list-item ${selected === item ? "active" : ""}`}
          onClick={() => onSelect(item)}
        >
          {highlightMatch(item, query)}
        </button>
      ))}
    </div>
  );
}
