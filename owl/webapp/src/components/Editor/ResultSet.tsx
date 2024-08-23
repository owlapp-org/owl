import { IEditorTabStore } from "@hooks/editorStore";
import { notifications } from "@mantine/notifications";
import { QueryResult } from "@ts/interfaces/database_interface";

import { useEffect, useRef, useState } from "react";
import DataGrid, { DataGridHandle } from "react-data-grid";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import "./styles.css";

function ResultSet({
  result,
  store,
}: {
  result: QueryResult;
  store: UseBoundStore<StoreApi<IEditorTabStore>>;
}) {
  const { run } = useStore(store);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [endRow, setEndRow] = useState(result.end_row || 0);
  const gridRef = useRef<DataGridHandle>(null);

  const headers = result.columns?.map((column) => ({
    key: column,
    name: column,
  }));

  useEffect(() => {
    const idx = 0,
      rowIdx = 0;
    gridRef.current!.scrollToCell({ idx, rowIdx });
    if (result.total_count) {
      setTotalCount(result.total_count);
      setRows(result.data || []);
    } else {
      setRows([]);
    }
    setEndRow(result.end_row || 0);
  }, [gridRef, result, setTotalCount, setRows, setEndRow]);

  function isAtBottom({
    currentTarget,
  }: React.UIEvent<HTMLDivElement>): boolean {
    return (
      Math.ceil(currentTarget.scrollTop) >=
      currentTarget.scrollHeight - currentTarget.clientHeight
    );
  }

  async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (isLoading || !isAtBottom(event)) return;

    if (endRow >= totalCount) return;

    const start_row = endRow;
    const end_row = Math.min(totalCount, start_row + 25);

    setIsLoading(true);
    try {
      const qr = await run(
        result.database_id,
        result.query,
        start_row,
        end_row,
        false
      );
      setRows([...rows, ...(qr.data || [])]);
      setEndRow(qr.end_row);
    } catch (e) {
      notifications.show({
        title: "Error",
        color: "red",
        message: `Failed to get more rows`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="rdg-light"
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <DataGrid
        ref={gridRef}
        columns={headers || []}
        rows={rows}
        style={{ height: "100%" }}
        className="rdg-light editor-data-grid"
        onScroll={handleScroll}
        onRowsChange={setRows}
      />
      {isLoading && <div className="load-more-grid">Loading more rows...</div>}
    </div>
  );
}

const ResultSetContainer = ({
  result,
  store,
}: {
  result?: QueryResult | undefined;
  store: UseBoundStore<StoreApi<IEditorTabStore>>;
}) => {
  if (result == undefined) {
    return <></>;
  } else {
    return <ResultSet result={result} store={store} />;
  }
};

export default ResultSetContainer;
