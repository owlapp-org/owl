import { memo } from "react";
import ResultSet from "./ResultSet";

const Panel = memo(() => {
  console.log("----");

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
      <ResultSet />
    </div>
  );
});

export default Panel;
