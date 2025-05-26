/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"; 
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

import Bills from "../containers/Bills.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock }) 
      
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      
      router()
      
      window.onNavigate(ROUTES_PATH.Bills)
      
      await waitFor(() => screen.getByTestId('icon-window'))
      
      const windowIcon = screen.getByTestId('icon-window')
      
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    })
    test("Then bills should be ordered from most recent to oldest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      
      const datesSorted = [...dates].sort(antiChrono)
      
      expect(dates).toEqual(datesSorted)
    })

    test("Click on 'New Bill' button should navigate to NewBill page", () => {
      const onNavigate = jest.fn();
      
      document.body.innerHTML = BillsUI({ data: [] });
      
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });
      
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      
      fireEvent.click(buttonNewBill);
      
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });

    test("Click on eye icon should open a modal with the bill image", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      
      const onNavigate = jest.fn();
      
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });
      
      $.fn.modal = jest.fn();
      
      $('#modaleFile').width = jest.fn(() => 600); 
      
      const eyeIcon = screen.getAllByTestId("icon-eye")[0];
      
      fireEvent.click(eyeIcon);
      
      expect($.fn.modal).toHaveBeenCalledWith("show");
      
      expect(document.querySelector(".bill-proof-container").innerHTML).toContain("img");
    });

    test("getBills() should return unformatted date if formatDate throws error", async () => {
      const faultyBill = {
        id: "3",
        name: "corrupted",
        date: "invalid-date",
        status: "pending",
        fileName: "proof.jpg"
      };
      
      const storeMock = {
        bills: () => ({
          list: jest.fn().mockResolvedValue([faultyBill])
        })
      };
      
      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: window.localStorage
      });
      
      const result = await billsContainer.getBills();
      
      expect(result[0].date).toBe("invalid-date");
      
      expect(result[0].status).toBe("En attente");
    });

    test("fetching bills from API fails with 404 error message", async () => {
      const storeMock = {
        bills: () => ({
          list: jest.fn().mockRejectedValueOnce(new Error("Erreur 404"))
        })
      };
    
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // éviter d'afficher dans la console
    
      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: window.localStorage
      });
    
      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 404");
    
      consoleErrorSpy.mockRestore();
    });

    test("fetching bills from API fails with 500 error message", async () => {
      const storeMock = {
        bills: () => ({
          list: jest.fn().mockRejectedValueOnce(new Error("Erreur 500"))
        })
      };
    
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // éviter d'afficher dans la console
    
      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: window.localStorage
      });
    
      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 500");
    
      consoleErrorSpy.mockRestore();
    });
    
    
  })
})
