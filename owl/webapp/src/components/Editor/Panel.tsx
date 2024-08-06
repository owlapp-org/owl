import ResultSet from "./ResultSet";

function Panel() {
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
}

export default Panel;
