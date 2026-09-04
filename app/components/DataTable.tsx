type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data.",
  rowKey = "id",
  className = "",
}: {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey?: string;
  className?: string;
}) {
  if (data.length === 0) {
    return <p className="text-govuk-grey-4">{emptyMessage}</p>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-govuk-black">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2 pr-4 font-bold ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={(row as Record<string, unknown>)[rowKey] as string}
              className="border-b border-govuk-grey-2 align-top"
            >
              {columns.map((col) => (
                <td key={col.key} className={`py-2 pr-4 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}