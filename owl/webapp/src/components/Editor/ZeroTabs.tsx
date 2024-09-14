import { Button } from "@mantine/core";
import { IconCodeDots, IconCube } from "@tabler/icons-react";

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
          onClick={onNewScriptTab}
          fullWidth
          variant="outline"
          rightSection={
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
          onClick={onNewMacroTab}
          fullWidth
          variant="outline"
          rightSection={
            <IconCube
              stroke={1}
              height={22}
              color="var(--mantine-color-blue-4)"
            />
          }
        >
          New Macro
        </Button>
      </div>
    </div>
  );
};

export default ZeroTabs;
