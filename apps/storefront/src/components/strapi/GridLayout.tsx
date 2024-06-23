import HtmlContent from "../HtmlContent";

interface GridLayoutProps {
  data: {
    id: string;
    gridColumn: any[];
  };
}
export default function GridLayout({ data }: GridLayoutProps) {
  const cols = data.gridColumn && data.gridColumn.length;
  return (
    <div className={`grid sm:grid-cols-1 md:grid-cols-${cols} md:gap-8 w-full py-12`}>
      {cols &&
        data.gridColumn.map((column, index) => {
          return (
            <div key={index}>
              <HtmlContent htmlContent={column} />
            </div>
          );
        })}
    </div>
  );
}
