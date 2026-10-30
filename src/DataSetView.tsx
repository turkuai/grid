import { useEffect, useRef, useState } from 'react';

type RowData = Record<string, unknown>;
type DataSetViewProps = {
  render: React.ComponentType<{ data: RowData }>;
  loadPage: (page: number) => Promise<RowData[]>;
};

export default function DataSetView({ render: Render, loadPage }: DataSetViewProps): React.JSX.Element {
  const [page, setPage] = useState<number>(1);
  const [realPage, setRealPage] = useState<number>(1);
  const [pageData, setPageData] = useState<object>({});
  const eleRef = useRef<any>(null);
  const maxPagesLoaded = 49; // Change to set maximum amount of pages shown pages are +1 so 49 is 50

  useEffect(() => {
    loadPage(realPage).then((pageItems) => {
      var obj: { [k: string]: any } = {};
      obj[realPage] = pageItems;
      if (pageItems.length > 0) {
        if (Object.keys(pageData).length > 0) {
          setRealPage(Number(Object.keys(pageData)[Object.keys(pageData).length - 1]) + 2);
        } else setRealPage(page == 1 ? 2 : (prev) => prev + 1);
        if (Object.keys(pageData).length > maxPagesLoaded) {
          var temp = Object.entries(pageData).map((e) => ({ [e[0]]: e[1] }));
          if (realPage > Number(Object.keys(pageData)[Object.keys(pageData).length - 1])) {
            temp = temp
              .slice(Object.keys(pageData).length - maxPagesLoaded)
              .concat(obj)
              .sort((a, b) => Number(Object.keys(a)[0]) - Number(Object.keys(b)[0]));
            eleRef.current.scrollTop =
              eleRef.current.scrollTop -
              (eleRef.current.scrollTop / maxPagesLoaded) * (1 - eleRef.current.offsetHeight / eleRef.current.scrollHeight);
          } else {
            temp.splice(maxPagesLoaded);
            temp = temp.concat(obj).sort((a, b) => Number(Object.keys(a)[0]) - Number(Object.keys(b)[0]));
            eleRef.current.scrollTop = (eleRef.current.scrollHeight / maxPagesLoaded) * (1 - 1 / (maxPagesLoaded + 1));
            setRealPage(Number(Object.keys(pageData)[Object.keys(pageData).length - 1]));
          }
          setPageData(temp.reduce((prev, curr) => ({ ...prev, ...curr }), {}));
        } else setPageData(page == 1 ? obj : (prev) => ({ ...prev, ...obj }));
      }
    });
  }, [page, loadPage]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      setPage((prev) => prev + 1);
    }
    if (el.scrollTop <= 0.5) {
      if (Object.keys(pageData).length > maxPagesLoaded) {
        if (realPage - (maxPagesLoaded + 2) > 0) {
          setRealPage((prev) => prev - (maxPagesLoaded + 2));
          setPage((prev) => prev + 1);
        }
      }
    }
  };
  return (
    <div ref={eleRef} style={{ height: '100%', overflowY: 'auto' }} onScroll={handleScroll}>
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
