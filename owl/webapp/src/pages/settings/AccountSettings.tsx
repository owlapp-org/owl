import { UserStorage } from "@lib/storage";
import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import UserService from "@services/userService";
import { useState } from "react";

export default function AccountSettings() {
  const user = UserStorage.get();
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const result = await UserService.updatePassword(password);
      showNotification({
        title: "Success",
        message: "Password updated successfully",
      });
    } catch (error: any) {
      showNotification({
        title: "Error",
        message: error?.response?.data,
      });
    }
  };

  return (
    <div
      style={{
        padding: 30,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, marginTop: 16 }}>
        <TextInput disabled label="Email" value={user?.email} />
      </div>
      <div style={{ width: "100%", maxWidth: 400, marginTop: 16 }}>
        <TextInput
          type="password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div style={{ width: "100%", maxWidth: 400, marginTop: 24 }}>
        <Button fullWidth onClick={handleSubmit}>
          Update
        </Button>
      </div>
    </div>
  );
}
