interface PanelProps {
  resultSetProps?: ResultSetProps;
}

import ResultSet, { ResultSetProps } from "./ResultSet";

function Panel(props: PanelProps) {
  const { resultSetProps } = props;
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
      <ResultSet {...resultSetProps} />
    </div>
  );
}

export default Panel;
