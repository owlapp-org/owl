import { MantineProvider } from "@mantine/core";
import React from "react";
import { MemoryRouter } from "react-router-dom";

interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => (
  <MemoryRouter>
    <MantineProvider>{children}</MantineProvider>
  </MemoryRouter>
);

export default TestWrapper;
