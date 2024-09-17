import { notifications } from "@mantine/notifications";

export namespace notify {
  export const show = (message: string) =>
    notifications.show({ title: "Info", message });
  export const info = show;
  export const error = (message: string) => {
    notifications.show({ color: "red", title: "Error", message });
    console.error("No files selected");
  };
}
