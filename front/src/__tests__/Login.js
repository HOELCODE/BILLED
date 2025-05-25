/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { fireEvent, screen } from "@testing-library/dom";

describe("Login - Employee and Admin flows", () => {
  let onNavigate;
  let localStorageMock;
  let PREVIOUS_LOCATION = "";
  let storeMock;

  beforeEach(() => {
    document.body.innerHTML = LoginUI();

    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    onNavigate = jest.fn();

    storeMock = {
      login: jest.fn().mockResolvedValue({ jwt: "fake-jwt-token" }),
      users: () => ({
        create: jest.fn().mockResolvedValue(true),
      }),
    };
  });

  test("Should store employee user in localStorage on submit", async () => {
    const login = new Login({
      document,
      localStorage: localStorageMock,
      onNavigate,
      PREVIOUS_LOCATION,
      store: storeMock,
    });

    fireEvent.change(screen.getByTestId("employee-email-input"), { target: { value: "employee@test.tld" } });
    fireEvent.change(screen.getByTestId("employee-password-input"), { target: { value: "azerty" } });

    fireEvent.submit(screen.getByTestId("form-employee"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "employee@test.tld",
        password: "azerty",
        status: "connected",
      })
    );
  });
  
  test("Should store admin user in localStorage on submit", async () => {
    const login = new Login({
      document,
      localStorage: localStorageMock,
      onNavigate,
      PREVIOUS_LOCATION,
      store: storeMock,
    });

    fireEvent.change(screen.getByTestId("admin-email-input"), { target: { value: "admin@test.tld" } });
    fireEvent.change(screen.getByTestId("admin-password-input"), { target: { value: "adminpass" } });

    fireEvent.submit(screen.getByTestId("form-admin"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify({
        type: "Admin",
        email: "admin@test.tld",
        password: "adminpass",
        status: "connected",
      })
    );
  });

  test("Should navigate to Dashboard, set PREVIOUS_LOCATION and update background color", async () => {
    const login = new Login({
      document,
      localStorage: localStorageMock,
      onNavigate,
      PREVIOUS_LOCATION,
      store: storeMock,
    });

    fireEvent.change(screen.getByTestId("admin-email-input"), { target: { value: "admin@test.tld" } });
    fireEvent.change(screen.getByTestId("admin-password-input"), { target: { value: "adminpass" } });

    fireEvent.submit(screen.getByTestId("form-admin"));

    await new Promise(process.nextTick);

    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]);

    expect(login.PREVIOUS_LOCATION).toBe(ROUTES_PATH["Dashboard"]);

    expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)");
  });
});
