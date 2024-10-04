import { Button, Checkbox, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, useState } from "react";

export interface IExportCSVProps {
  onSubmit: (
    filename: string,
    file_type: string,
    options: Record<string, any>
  ) => void;
}

const ExportCSVForm: FC<IExportCSVProps> = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      filename: "owl-data-export.csv",
      compress: false,
      header: true,
      delimiter: ",",
      quote: '"',
      escape_quote: '"',
      date_format: "%Y.%m.%d %H:%M:%s",
    },
  });
  const handleClose = () => {
    form.reset();
    setIsLoading(false);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      await onSubmit(values.filename, "CSV", {
        compress: values.compress,
        header: values.header,
        delimiter: values.delimiter,
        quote: values.quote,
        escape_quote: values.escape_quote,
        date_format: values.date_format,
      });
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => handleSubmit(values))}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <TextInput label="File name" {...form.getInputProps("filename")} />
      <Checkbox label="Compress" {...form.getInputProps("compress")} />
      <Checkbox
        label="Header"
        {...form.getInputProps("header")}
        defaultChecked
      />
      <TextInput label="Delimiter" {...form.getInputProps("delimiter")} />
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          justifyItems: "center",
          gap: "10px",
        }}
      >
        <TextInput
          label="Quote"
          placeholder="Quote character"
          {...form.getInputProps("quote")}
        />
        <TextInput
          label="Quote escape"
          placeholder="Escape quote character"
          {...form.getInputProps("escape_quote")}
        />
      </div>
      <TextInput
        label="Date format"
        placeholder="%Y.%m.%d %H:%M:%s"
        {...form.getInputProps("date_format")}
      />
      <Stack mt="20">
        <Button type="submit" loading={isLoading}>
          Export
        </Button>
      </Stack>
    </form>
  );
};

export default ExportCSVForm;
