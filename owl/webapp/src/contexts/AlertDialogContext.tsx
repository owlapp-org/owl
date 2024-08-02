import AlertDialog from "@components/AlertDialog";
import { createContext, ReactNode, useContext, useState } from "react";

interface AlertDialogContextProps {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

interface DialogOptions {
  title: string;
  body: string;
  okButtonLabel?: string;
  cancelButtonLabel?: string;
  loading?: boolean;
  onOk?: (event: React.MouseEvent) => void;
  onCancel?: (event: React.MouseEvent) => void;
}

const AlertDialogContext = createContext<AlertDialogContextProps | undefined>(
  undefined
);

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      "useAlertDialog must be used within an AlertDialogProvider"
    );
  }
  return context;
};

export const AlertDialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(
    null
  );
  const [open, setOpen] = useState(false);

  const showDialog = (options: DialogOptions) => {
    setDialogOptions(options);
    setOpen(true);
  };

  const hideDialog = () => {
    setOpen(false);
  };

  return (
    <AlertDialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {dialogOptions && (
        <AlertDialog
          open={open}
          onClose={hideDialog}
          title={dialogOptions.title}
          body={dialogOptions.body}
          okButtonLabel={dialogOptions.okButtonLabel || "OK"}
          cancelButtonLabel={dialogOptions.cancelButtonLabel || "Cancel"}
          loading={dialogOptions.loading || false}
          onOk={(event: React.MouseEvent) => {
            dialogOptions.onOk?.(event);
            hideDialog();
          }}
          onCancel={(event: React.MouseEvent) => {
            dialogOptions.onCancel?.(event);
            hideDialog();
          }}
        />
      )}
    </AlertDialogContext.Provider>
  );
};
