import { Button } from "@mantine/core";
import {
  IconCodeDots,
  IconCube,
  IconReportAnalytics,
} from "@tabler/icons-react";

export interface IZeroTabsProps {
  onNewScriptTab: () => void;
  onNewMacroTab: () => void;
}

const ZeroTabs = ({ onNewScriptTab, onNewMacroTab }: IZeroTabsProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        paddingTop: "50px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "20%",
          height: "100",
          gap: "10px",
        }}
      >
        <Button
          styles={{
            inner: {
              justifyContent: "start",
            },
          }}
          onClick={onNewScriptTab}
          fullWidth
          variant="outline"
          leftSection={
            <IconCodeDots
              stroke={1}
              height={22}
              color="var(--mantine-color-blue-4)"
            />
          }
        >
          New Query
        </Button>
        <Button
          styles={{
            inner: {
              justifyContent: "start",
            },
          }}
          onClick={onNewMacroTab}
          fullWidth
          variant="outline"
          leftSection={
            <IconCube
              stroke={1}
              height={22}
              color="var(--mantine-color-blue-4)"
            />
          }
        >
          New Macro
        </Button>
        <Button
          styles={{
            inner: {
              justifyContent: "start",
            },
          }}
          onClick={onNewMacroTab}
          fullWidth
          variant="outline"
          leftSection={
            <IconReportAnalytics
              stroke={1}
              height={22}
              color="var(--mantine-color-blue-4)"
            />
          }
        >
          New Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ZeroTabs;
