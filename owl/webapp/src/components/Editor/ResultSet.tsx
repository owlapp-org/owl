import useEditorStore from "@hooks/editorStore";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css"; // Optional Theme applied to the Data Grid

import { AgGridReact } from "ag-grid-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ResultSet() {
  const gridRef = useRef<any>(null);
  const { run, queryResult, data } = useEditorStore();
  const [loading, setLoading] = useState(false);

  const columnNames = useMemo(() => {
    return queryResult?.columns?.map((column) => ({
      headerName: column,
      field: column,
    }));
  }, [queryResult]);

  const handleFetchRows = async (params: any) => {
    console.log(data);
    if (queryResult === undefined) {
      return;
    }
    const { startRow, endRow } = params;
    console.log(startRow, endRow);
    if (queryResult?.database_id && queryResult?.query) {
      try {
        setLoading(true);
        await run(
          queryResult?.database_id,
          queryResult?.query,
          startRow,
          endRow
        );
        params.successCallback(data, queryResult.total_count);
      } catch (err) {
        params.failCallback();
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log(data);
    if (gridRef.current && queryResult) {
      gridRef.current.setGridOption("datasource", {
        getRows: (params: any) => {
          console.log(data);
          params.successCallback(data, queryResult.total_count);
        },
      });
    }
  }, [queryResult, data]);

  const onGridReady = (params: any) => {
    gridRef.current = params.api;
    params.api.setGridOption("datasource", {
      getRows: handleFetchRows,
    });
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
