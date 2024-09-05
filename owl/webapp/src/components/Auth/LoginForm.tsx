import useUserStore from "@hooks/userStore";
import { Avatar, Button, Checkbox, Group, TextInput } from "@mantine/core";
import { AppService } from "@services/appService";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const { login } = useUserStore();

  useEffect(() => {
    AppService.getConfig().then((config) => {
      setIsGoogleLogin(config.google_login);
    });
  }, [setIsGoogleLogin]);

  useCallback(() => {
    Cookies.set("login-remember-me", String(rememberMe));
  }, [rememberMe]);

  const onGoogleLogin = () => {
    const basePath = window.location.origin;
    window.location.href = `${basePath}/api/auth/google/login`;
  };

  const handleLogin = async () => {
    try {
      await login(email, password, rememberMe);
      navigate("/ui");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials and try again.");
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
      <Avatar radius="xl" />

      <h5>Sign in to Owl</h5>
      <div style={{ width: "100%", maxWidth: 400, marginTop: 16 }}>
        <TextInput
          label="Email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <TextInput
          type="password"
          label="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Group
        align="center"
        justify="space-between"
        style={{
          width: "100%",
          maxWidth: 400,
          marginTop: 16,
        }}
      >
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.currentTarget.checked)}
        />
        {/* <Anchor href="#" size="sm">
          Forgot password?
        </Anchor> */}
      </Group>
      <div style={{ width: "100%", maxWidth: 400, marginTop: 16 }}>
        <Button
          fullWidth
          onClick={handleLogin}
          disabled={email === "" || password === ""}
        >
          Login
        </Button>
      </div>
      {isGoogleLogin && (
        <div style={{ width: "100%", maxWidth: 400, marginTop: 16 }}>
          <Button fullWidth onClick={onGoogleLogin}>
            Google Login
          </Button>
        </div>
      )}
    </div>
  );
}
