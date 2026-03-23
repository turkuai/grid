import React from "react";
import "./List.css";

export const languages = [
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

export function List({ items, query }) {
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <strong>{match}</strong>
        {after}
      </>
    );
  };

  return (
    <ul className="list">
      {items.map((item, index) => (
        <li key={index}>{highlightMatch(item, query)}</li>
      ))}
    </ul>
  );
}