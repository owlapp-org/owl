import { UserStorage } from "@lib/storage";
import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import UserService from "@services/userService";
import { useEffect, useState } from "react";

export default function AccountSettings() {
  const user = UserStorage.get();
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const name = UserStorage.get()?.name;
    if (name) {
      setName(name);
    }
  });

  const handleSubmit = async () => {
    try {
      const user = await UserService.updateUser(name, password);
      if (user) {
        let u = UserStorage.get();
        if (u) {
          u.name = user.name;
          UserStorage.set(u);
        }
      }
      showNotification({
        title: "Success",
        message: "User updated successfully",
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
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <Button fullWidth onClick={handleSubmit} disabled={!password || !name}>
          Update
        </Button>
      </div>
    </div>
  );
}
