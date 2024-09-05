import useUserStore from "@hooks/userStore";
import { Button, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

export default function AccountSettings() {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentName, email, updateUser } = useUserStore((state) => ({
    currentName: state.name,
    email: state.email,
    updateUser: state.update,
  }));

  useEffect(() => {
    currentName && setName(name);
  }, [currentName]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await updateUser(name, password);
    } finally {
      setIsLoading(false);
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
        <TextInput disabled label="Email" value={email} />
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
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={!password || !name}
          loading={isLoading}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
