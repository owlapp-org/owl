import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export interface IZeroTabsProps {
  onNewTab: () => void;
}

const ZeroTabs = ({ onNewTab }: IZeroTabsProps) => {
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
          width: "40%",
        }}
      >
        <Button
          onClick={onNewTab}
          fullWidth
          variant="outline"
          rightSection={<IconPlus size={24} stroke={1} />}
        >
          New Query
        </Button>
      </div>
    </div>
  );
};

export default ZeroTabs;
