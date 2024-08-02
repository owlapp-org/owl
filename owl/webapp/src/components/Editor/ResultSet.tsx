import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css"; // Optional Theme applied to the Data Grid

import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";

export interface ResultSetProps<T = Record<string, unknown>> {
  records?: Array<T>;
  columnNames?: Array<string>;
}

export default function ResultSet(props: ResultSetProps) {
  const { records, columnNames = [] } = props;

  const columns = useMemo(() => {
    return columnNames.map((column) => ({
      headerName: column,
      field: column,
    }));
  }, [columnNames]);

  return (
    <div
      className="ag-theme-balham"
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <AgGridReact
        rowData={records}
        columnDefs={columns}
        rowSelection="single"
      />
    </div>
  );
}
