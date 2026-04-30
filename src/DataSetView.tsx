import { useEffect, useState } from "react";

type RowData = Record<string, unknown>;
type DataSetViewProps = {
  render: React.ComponentType<{ data: RowData }>;
  loadPage: (page: number) => Promise<RowData[]>;
};

export default function DataSetView({ render: Render, loadPage }: DataSetViewProps): React.JSX.Element {
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<RowData[]>([]);
  useEffect(() => {
    loadPage(page).then((pageItems) => {
      setItems((prev) => [...prev, ...pageItems]);
    });
  }, [page, loadPage]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      setPage((prev) => prev + 1);
    }
  };
  return (
    <div style={{ height: "100%", overflowY: "auto" }} onScroll={handleScroll}>
      <div>
        {items.map((item, index) => (
          <Render key={index} data={item} />
        ))}
      </div>
    </div>
  );
}
