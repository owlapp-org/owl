import useEditorStore from "@hooks/editorStore";
import { QueryResult } from "@ts/interfaces/database_interface";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css"; // Optional Theme applied to the Data Grid

import { AgGridReact } from "ag-grid-react";
import { useEffect, useMemo, useRef, useState } from "react";

function ResultSet({ result }: { result: QueryResult }) {
  const gridRef = useRef<any>(null);
  const run = useEditorStore((state) => state.run);
  const [loading, setLoading] = useState(false);

  const headers = result.columns?.map((column) => ({
    headerName: column,
    field: column,
  }));

  const updateGrid = (result: QueryResult, params: any) => {
    let lastRow = -1;
    if (result?.total_count && params.endRow >= result?.total_count) {
      lastRow = result?.total_count;
    }
    params.successCallback(result?.data, lastRow);
  };

  const getDatasource = (result: QueryResult) => {
    return {
      getRows: (params: any) => {
        if (params.startRow > 0) {
          setLoading(true);
          run(result.database_id, result.query, params.startRow, params.endRow)
            .then((result: QueryResult) => updateGrid(result, params))
            .catch(params.failCallback)
            .finally(() => setLoading(false));
        } else {
          console.log(result);
          updateGrid(result, params);
        }
      },
      destroy: () => {
        // use to clean resources
      },
    };
  };

  useEffect(() => {
    if (gridRef.current.setGridOption) {
      console.log("getDatasource 1");
      gridRef.current.setGridOption("datasource", getDatasource(result));
    }
  }, [result]);

  const onGridReady = (params: any) => {
    gridRef.current = params.api;
    if (gridRef.current.setGridOption) {
      gridRef.current.setGridOption("datasource", getDatasource(result));
      console.log("getDatasource 2");
    }
  };

  const defaultColDef = useMemo(() => {
    return {
      sortable: false,
    };
  }, []);

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
        columnDefs={headers}
        onGridReady={onGridReady}
        rowModelType="infinite"
        cacheBlockSize={25}
        rowSelection="single"
        defaultColDef={defaultColDef}
      />
    </div>
  );
}

const ResultSetContainer = ({
  result,
}: {
  result?: QueryResult | undefined;
}) => {
  if (result == undefined) {
    return <></>;
  } else {
    return <ResultSet result={result} />;
  }
};

export default ResultSetContainer;
