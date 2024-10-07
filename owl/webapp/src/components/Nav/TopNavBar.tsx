import { ActionIcon, Flex } from "@mantine/core";
import { IconApi, IconBrandGithub, IconMenu2 } from "@tabler/icons-react";
import React from "react";

interface TopNavBarProps {
  onMenuClick: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = (props) => {
  const { onMenuClick, ...otherProps } = props;
  return (
    <Flex
      align={"center"}
      justify={"space-between"}
      px="md"
      py={0}
      mih={42}
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-2)",
        boxSizing: "border-box",
      }}
      {...otherProps}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActionIcon variant="transparent" onClick={onMenuClick}>
          <IconMenu2 size={24} stroke={1} />
        </ActionIcon>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <ActionIcon
          variant="transparent"
          onClick={() => {
            window.open(`/api/docs`, "_blank");
          }}
        >
          <IconApi size={24} stroke={1} color="var(--mantine-color-gray-7)" />
        </ActionIcon>
        <ActionIcon
          variant="transparent"
          onClick={() => {
            window.open("https://github.com/owlapp-org/owl", "_blank");
          }}
        >
          <IconBrandGithub
            size={24}
            stroke={1}
            color="var(--mantine-color-gray-7)"
          />
        </ActionIcon>
      </div>
    </Flex>
  );
};

export default TopNavBar;
