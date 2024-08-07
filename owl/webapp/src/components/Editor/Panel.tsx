import { QueryResult } from "@ts/interfaces/database_interface";
import ResultSetContainer from "./ResultSet";

const Panel = ({ result }: { result?: QueryResult }) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        paddingBottom: "52px",
      }}
    >
      <ResultSetContainer result={result} />
    </div>
  );
};

export default Panel;
