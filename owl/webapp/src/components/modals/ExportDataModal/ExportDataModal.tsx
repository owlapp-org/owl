import { notify } from "@lib/notify";
import { Modal, Select } from "@mantine/core";
import { databaseService } from "@services/services";
import { FC, useState } from "react";
import ExportCSVForm from "./ExportCSVForm";
import { useExportDataModalStore } from "./useExportDataModalStore";

const ExportDataModal: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { query, databaseId, open, destroy, closeModal } =
    useExportDataModalStore();

  const handleClose = () => {
    closeModal();
  };
  const handleExport = async (
    filename: string,
    file_type: string,
    options: Record<string, any>
  ) => {
    setIsLoading(true);
    try {
      await databaseService.exportData(
        databaseId,
        query,
        filename,
        file_type,
        options
      );
      closeModal();
    } catch (e: any) {
      notify.error(`Error exporting data ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} withCloseButton={false}>
      <Select
        allowDeselect={false}
        label="File type"
        placeholder="Pick value"
        defaultValue={"CSV"}
        data={["CSV"]}
        mb={15}
        disabled={isLoading}
      />
      <ExportCSVForm onSubmit={handleExport} />
    </Modal>
  );
};

export default ExportDataModal;
