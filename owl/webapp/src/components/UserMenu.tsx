import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { IconChevronRight, IconUser } from "@tabler/icons-react";
import { forwardRef } from "react";

import { Menu } from "@mantine/core";
import { IconHelp, IconLogout, IconSettings } from "@tabler/icons-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"div"> {
  userName?: string;
  opened: boolean;
  onClick: () => void;
}

const UserButton = forwardRef<HTMLDivElement, UserButtonProps>(
  ({ userName, opened, onClick, ...others }: UserButtonProps, ref) => (
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

interface UserMenuProps {
  userName?: string;
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onLogoutClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
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

  const menuTextStyle = {
    fontWeight: 300,
  };

  return (
    <Menu position="bottom-start" width={300}>
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
            <Text style={menuTextStyle}>Settings</Text>
          </Group>
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setOpened(false);
            onHelpClick();
          }}
        >
          <Group>
            <IconHelp size={18} stroke={1} />
            <Text style={menuTextStyle}>Help</Text>
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
            <Text style={menuTextStyle}>Log Out</Text>
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
