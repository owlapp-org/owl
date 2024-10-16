import { ActionIcon, Box, Group, Text } from "@mantine/core";
import {
  IconChevronRight,
  IconInfoCircle,
  IconUser,
} from "@tabler/icons-react";
import { forwardRef } from "react";

import { Menu } from "@mantine/core";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface IUserButtonProps extends React.ComponentPropsWithoutRef<"div"> {
  userName?: string;
  opened: boolean;
  onClick: () => void;
}

const UserButton = forwardRef<HTMLDivElement, IUserButtonProps>(
  ({ userName, opened, onClick, ...others }: IUserButtonProps, ref) => (
    <Box
      ref={ref}
      style={{
        padding: "0",
        borderRadius: "var(--mantine-radius-sm)",
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        cursor: "pointer",
      }}
      onClick={onClick}
      {...others}
    >
      <Group
        px={10}
        gap={7}
        align="center"
        style={{
          width: "100%",
        }}
      >
        <ActionIcon size="sm" variant="transparent">
          <IconUser stroke={1} />
        </ActionIcon>
        <Text size="md" style={{ flex: 1, textAlign: "left", fontWeight: 300 }}>
          {userName}
        </Text>
        <ActionIcon variant="transparent">
          <IconChevronRight stroke={1} />
        </ActionIcon>
      </Group>
    </Box>
  )
);

interface IUserMenuProps {
  userName?: string;
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onLogoutClick: () => void;
}

const UserMenu: React.FC<IUserMenuProps> = ({
  userName,
  onSettingsClick,
  onHelpClick,
  onLogoutClick,
}) => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/ui/auth/login");
    onLogoutClick();
  };

  return (
    <Menu position="bottom-start" width={270}>
      <Menu.Target>
        <UserButton
          userName={userName}
          opened={opened}
          onClick={() => setOpened((o) => !o)}
        />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            setOpened(false);
            onSettingsClick();
          }}
        >
          <Group>
            <IconSettings size={18} stroke={1} />
            <Text fw={300}>Settings</Text>
          </Group>
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setOpened(false);
            onHelpClick();
          }}
        >
          <Group>
            <IconInfoCircle size={18} stroke={1} />
            <Text fw={300}>About</Text>
          </Group>
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setOpened(false);
            handleLogout();
          }}
        >
          <Group>
            <IconLogout size={18} stroke={1} />
            <Text fw={300}>Log Out</Text>
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
