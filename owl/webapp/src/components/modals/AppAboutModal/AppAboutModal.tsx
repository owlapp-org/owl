import AppIcon from "@components/icons/AppIcon";
import { notify } from "@lib/notify";
import {
  Button,
  Flex,
  Modal,
  NavLink,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { AppService } from "@services/appService";
import { IAppAbout } from "@ts/interfaces/interfaces";
import { FC, useEffect, useState } from "react";
import { useAppAboutModalStore } from "./useAppAboutModalStore";

const AppAboutModal: FC = () => {
  const { open, destroy } = useAppAboutModalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [about, setAbout] = useState<IAppAbout | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setIsLoading(true);
    AppService.getAbout()
      .then((about) => {
        setAbout(about);
      })
      .catch((error) => {
        notify.error(`Failed to get app info. ${error}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setIsLoading, setAbout, AppService]);

  return (
    <Modal opened={open} onClose={destroy} withCloseButton={false}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Flex
          p={0}
          w={"100%"}
          gap={10}
          style={{
            textAlign: "center",
            justifyContent: "left",
            alignItems: "center",
          }}
        >
          <AppIcon width="28px" height="28px" />
          <Text size="xl" c="gray.7">
            About Owl
          </Text>
        </Flex>
        <Skeleton visible={isLoading}>
          <Text size="sm" c="red.4">
            Version {about?.version}
          </Text>
          <Stack
            justify={"start"}
            align={"start"}
            gap={0}
            style={{
              alignItems: "start",
            }}
          >
            <Text size="sm" c="green.7">
              {about?.last_commit_date.toString()}
            </Text>
            <NavLink
              mt={0}
              c="dimmed"
              p={0}
              td="underline"
              href="https://github.com/ceyhunkerti/owl"
              label={about?.last_commit_hash}
              target="_blank"
              rel="noopener noreferrer"
            />
          </Stack>
        </Skeleton>
        <Button onClick={destroy} mt={10}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default AppAboutModal;
