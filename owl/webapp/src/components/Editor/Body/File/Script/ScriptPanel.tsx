import { CodeHighlight } from "@mantine/code-highlight";
import { IconBorderAll } from "@tabler/icons-react";
import { IQueryResult } from "@ts/interfaces/interfaces";
import ResultSetContainer from "./ResultSet";

interface IPanelProps {
  active?: number;
  result?: IQueryResult;
  renderedContent?: string | null;
}

const ScriptPanel: React.FC<IPanelProps> = ({
  result,
  active = 0,
  renderedContent = null,
}) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {active == 0 && !result && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            <IconBorderAll
              size={48}
              stroke={1}
              color="var(--mantine-color-gray-2)"
            />
          </div>
          <div style={{ color: "var(--mantine-color-gray-4)" }}>
            Results will be shown here
          </div>
        </div>
      )}
      {active == 1 && result && <ResultSetContainer result={result} />}
      {active == 2 && renderedContent !== null && (
        <CodeHighlight
          className="app-code-highlight macro-code-highlight"
          styles={{
            root: {
              marginTop: "0px !important;",
              paddingTop: "0px",
            },
          }}
          style={{
            marginTop: "0px !important;",
            padding: "0px",
            width: "100%",
            height: "100%",
            flexGrow: "1",
          }}
          code={renderedContent}
          language="sql"
          mt="md"
        />
      )}
    </div>
  );
};

export default ScriptPanel;
