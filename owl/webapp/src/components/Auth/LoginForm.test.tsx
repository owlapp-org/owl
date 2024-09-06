import TestWrapper from "@test-utils/TestWrapper";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";

afterEach(cleanup);

vi.mock("@services/authService", () => ({
  login: vi.fn().mockResolvedValue({ token: "fake-token" }),
}));

describe("LoginForm", () => {
  it("renders login form", () => {
    const { getByLabelText, getByRole } = render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Check initial render
    const emailInput = getByLabelText(/Email/);
    const passwordInput = getByLabelText(/Password/);
    const loginButton = getByRole("button", { name: /Login/ });

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(loginButton).toBeTruthy();
    expect(loginButton).toBeDisabled();

    // Simulate user input
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(loginButton).toBeDisabled();
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(loginButton).not.toBeDisabled();

    // Optionally, you can check if the button is enabled when fields are empty
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "" } });
    expect(loginButton).toBeDisabled();
  });
  it("calls handleLogin when the Login button is clicked", async () => {
    const { AuthService } = await import("@services/authService");

    const { getByLabelText, getByRole } = render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    fireEvent.change(getByLabelText(/Email/), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByLabelText(/Password/), {
      target: { value: "password123" },
    });

    fireEvent.click(getByRole("button", { name: /Login/ }));

    expect(AuthService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
  });
});
