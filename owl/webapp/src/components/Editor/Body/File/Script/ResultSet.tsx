import { notifications } from "@mantine/notifications";
import { IQueryResult } from "@ts/interfaces/interfaces";

import "@components/Editor/styles.css";
import { databaseService } from "@services/services";
import { useEffect, useRef, useState } from "react";
import DataGrid, { DataGridHandle } from "react-data-grid";

interface IResultSetContainerProps {
  result?: IQueryResult;
}
interface IResultSetProps {
  result: IQueryResult;
}

const ResultSet: React.FC<IResultSetProps> = ({ result }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [endRow, setEndRow] = useState(result.end_row || 0);
  const gridRef = useRef<DataGridHandle>(null);
  const { database_id: databaseId, query_id } = result;

  const defaultColumnProperties = {
    resizable: true,
  };
  const headers = result.columns
    ?.map((column) => ({
      key: column,
      name: column,
    }))
    .map((c) => ({ ...c, ...defaultColumnProperties }));

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
      const qr = await databaseService.run(
        databaseId,
        result.query,
        start_row,
        end_row,
        false,
        query_id
      );
      if (qr) {
        setRows([...rows, ...(qr.data || [])]);
        setEndRow(qr.end_row!);
      }
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
        style={{ height: "100%", width: "100%" }}
        className="rdg-light editor-data-grid"
        onScroll={handleScroll}
        onRowsChange={setRows}
      />
      {isLoading && <div className="load-more-grid">Loading more rows...</div>}
    </div>
  );
};

const ResultSetContainer: React.FC<IResultSetContainerProps> = ({ result }) => {
  if (result == undefined) {
    return <></>;
  } else {
    return <ResultSet result={result} />;
  }
};

export default ResultSetContainer;
