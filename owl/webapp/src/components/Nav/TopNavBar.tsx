import { ActionIcon, Flex } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import React from "react";

interface TopNavBarProps {
  onMenuClick: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = (props) => {
  const { onMenuClick, ...otherProps } = props;
  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      px="md"
      py="xs"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
      {...otherProps}
    >
      <ActionIcon variant="transparent" onClick={onMenuClick}>
        <IconMenu2 size={24} stroke={1} />
      </ActionIcon>
    </Flex>
  );
};

export default TopNavBar;
