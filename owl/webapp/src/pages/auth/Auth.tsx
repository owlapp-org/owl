import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";

export default function Auth() {
  return (
    <Box
      component="section"
      style={{
        padding: "16px",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Outlet />
    </Box>
  );
}
