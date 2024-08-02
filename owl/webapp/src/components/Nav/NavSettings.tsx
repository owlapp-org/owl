import {
  ActionIcon,
  Container,
  Divider,
  Group,
  List,
  ListItem,
  Text,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { FC } from "react";
import "./index.css";

interface NavSettingsProps {
  onBack: () => void;
}

const NavSettings: FC<NavSettingsProps> = ({ onBack }) => {
  const handleItemClick = (item: string) => {
    // Handle item click (e.g., navigate to a specific section)
    console.log(`Clicked on ${item}`);
  };

  return (
    <Container p={0}>
      <Group
        onClick={onBack}
        align="center"
        gap={14}
        py={4}
        px={4}
        style={{
          cursor: "pointer",
        }}
      >
        <ActionIcon variant="transparent">
          <IconChevronLeft size={20} stroke={1} />
        </ActionIcon>
        <Text size="md">Back</Text>
      </Group>
      <Divider />
      <List spacing="xs" size="sm" mb="md" className="nav-settings-list">
        <ListItem
          className="selected"
          onClick={() => handleItemClick("General")}
        >
          Account
        </ListItem>
      </List>
    </Container>
  );
};

export default NavSettings;
