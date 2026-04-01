import "./List.css";

type ListProps = {
  items: string[];
  recentData: string[];
  query: string;
  selected: string;
  onSelect: (value: string) => void;
};

export function List({
  items,
  recentData,
  query,
  selected,
  onSelect,
}: ListProps) {
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query) {
      return text;
    }

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) {
      return text;
    }

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

  const q = query.toLowerCase();

  const filteredRecent = recentData.filter((item) =>
    item.toLowerCase().includes(q),
  );

  const normalItems = items
    .filter((item) => !recentData.includes(item))
    .filter((item) => item.toLowerCase().includes(q));

  return (
    <div className="list">
      {filteredRecent.map((item, index) => (
        <button
          key={`recent-${index}`}
          className={`list-item ${selected === item ? "active" : ""}`}
          onClick={() => onSelect(item)}
        >
          {highlightMatch(item, query)}
        </button>
      ))}

      {filteredRecent.length > 0 && normalItems.length > 0 && (
        <hr style={{ margin: "4px 0" }} />
      )}

      {normalItems.map((item, index) => (
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
