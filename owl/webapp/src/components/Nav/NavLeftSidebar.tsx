import { FC, useEffect, useState } from "react";

import UserMenu from "@components/UserMenu";
import { Flex } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { UserStorage } from "src/lib/storage";
import NavExplorer from "./NavExplorer"; // Assuming you have this component
import NavSettings from "./NavSettings";

interface NavLeftSidebarProps {}

const NavLeftSidebar: FC<NavLeftSidebarProps> = ({}) => {
  const user = UserStorage.get();
  const [isSettingsView, setIsSettingsView] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSettingsView(location.pathname.startsWith("/ui/settings"));
  }, [location]);

  const handleSettingsClick = () => {
    setIsSettingsView(true);
    navigate("/ui/settings");
  };

  const handleHelpClick = () => {
    console.log("Help clicked");
  };

  const handleLogoutClick = () => {
    UserStorage.clear();
  };

  const handleBackToExplorer = () => {
    setIsSettingsView(false);
    navigate("/");
  };

  return (
    <div style={{ height: "100%" }}>
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        mih={42}
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        <UserMenu
          userName={user?.name}
          onSettingsClick={handleSettingsClick}
          onHelpClick={handleHelpClick}
          onLogoutClick={handleLogoutClick}
        />
      </Flex>
      {isSettingsView ? (
        <NavSettings onBack={handleBackToExplorer} />
      ) : (
        <NavExplorer />
      )}
    </div>
  );
};

export default NavLeftSidebar;
