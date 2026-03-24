import "./List.css";

export const languages: string[] = [
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

interface ListProps {
  items: string[];
  query: string;
  selected: string;
  onSelect: (selection: string) => void;
}

export function List({ items, query, selected, onSelect }: ListProps) {
  const highlightMatch = (text: string, query: string) => {
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
    <div className="list">
      {items.map((item: string, index: number) => (
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