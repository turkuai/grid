import { useEffect, useState } from 'react';

type RowData = Record<string, unknown>;
type DataSetViewProps = {
  render: React.ComponentType<{ data: RowData }>;
  loadPage: (page: number) => Promise<RowData[]>;
};

export default function DataSetView({ render: Render, loadPage }: DataSetViewProps): React.JSX.Element {
  const [page, setPage] = useState<number>(1);
  const [realPage, setRealPage] = useState<number>(1);
  const [pageData, setPageData] = useState<object>({});
  useEffect(() => {
    loadPage(realPage).then((pageItems) => {
      var obj: { [k: string]: any } = {};
      obj[realPage] = pageItems;
      if (pageItems.length > 0) {
        if (Object.keys(pageData).length > 0) {
          setRealPage(Number(Object.keys(pageData)[Object.keys(pageData).length - 1]) + 2);
        } else setRealPage(page == 1 ? 2 : (prev) => prev + 1);
        setPageData(page == 1 ? obj : (prev) => ({ ...prev, ...obj }));
      }
    });
  }, [page, loadPage]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      setPage((prev) => prev + 1);
    }
  };
  return (
    <div style={{ height: '100%', overflowY: 'auto' }} onScroll={handleScroll}>
      <div>
        {Object.values(pageData)
          .flat(1)
          .map((item, index) => (
            <Render key={index} data={item} />
          ))}
      </div>
    </div>
  );
}
