import { Button, LoadingOverlay, Modal, Text } from "@mantine/core";
import React from "react";

export interface AlertDialogProps {
  open: boolean;
  title: string;
  body: string;
  okButtonLabel: string;
  cancelButtonLabel: string;
  loading?: boolean;
  onOk?: (event: React.MouseEvent) => void;
  onCancel?: (event: React.MouseEvent) => void;
  onClose?: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  title,
  body,
  okButtonLabel = "OK",
  cancelButtonLabel = "Cancel",
  loading = false,
  onOk = () => {},
  onCancel = () => {},
  onClose = () => {},
}) => {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={title}
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <LoadingOverlay visible={loading} />
      <Text>{body}</Text>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
      >
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {cancelButtonLabel}
        </Button>
        <Button onClick={onOk} loading={loading} ml={10}>
          {okButtonLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default AlertDialog;
