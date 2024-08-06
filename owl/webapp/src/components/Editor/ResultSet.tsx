import useEditorStore from "@hooks/editorStore";
import { QueryResult } from "@ts/interfaces/database_interface";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css"; // Optional Theme applied to the Data Grid

import { AgGridReact } from "ag-grid-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ResultSet() {
  const gridRef = useRef<any>(null);
  const run = useEditorStore((state) => state.run);
  const queryResult = useEditorStore((state) => state.queryResult);

  const [loading, setLoading] = useState(false);

  const columnNames = useMemo(() => {
    return queryResult?.columns?.map((column) => ({
      headerName: column,
      field: column,
    }));
  }, [queryResult]);

  const updateGrid = (result: QueryResult, params: any) => {
    let lastRow = -1;
    if (result?.total_count && params.endRow >= result?.total_count) {
      lastRow = result?.total_count;
    }
    params.successCallback(result?.data, lastRow);
  };

  useEffect(() => {
    if (gridRef.current?.getGridOption && queryResult) {
      !gridRef.current.getGridOption("datasource") &&
        gridRef.current.setGridOption("datasource", {
          getRows: (params: any) => {
            if (params.startRow) {
              setLoading(true);
              run(
                queryResult?.database_id,
                queryResult?.query,
                params.startRow,
                params.endRow
              )
                .then((result: QueryResult) => updateGrid(result, params))
                .catch(params.failCallback)
                .finally(() => setLoading(false));
            } else {
              updateGrid(queryResult, params);
            }
          },
        });
    }
  }, [queryResult]);

  const onGridReady = (params: any) => {
    gridRef.current = params.api;
  };

  return (
    <div
      className="ag-theme-balham"
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <AgGridReact
        loading={loading}
        ref={gridRef}
        columnDefs={columnNames}
        onGridReady={onGridReady}
        rowModelType="infinite"
        cacheBlockSize={25}
        rowSelection="single"
      />
    </div>
  );
}
