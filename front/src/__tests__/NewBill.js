/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import '@testing-library/jest-dom'

// Mock du localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => JSON.stringify({ email: 'test@company.com' })),
    setItem: jest.fn(),
    removeItem: jest.fn()
  },
  writable: true
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let updateMock
    let createMock
    let storeMock
    let onNavigate

    beforeEach(() => {
      document.body.innerHTML = NewBillUI()

      updateMock = jest.fn().mockResolvedValue()
      createMock = jest.fn().mockResolvedValue({
        fileUrl: 'https://localhost/bill.jpg',
        key: '1234'
      })

      storeMock = {
        bills: jest.fn(() => ({
          create: createMock,
          update: updateMock
        }))
      }

      onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = pathname
      })

      new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })
    })


    test("Then uploading a valid file should call store.create and set fileUrl and fileName", async () => {
      const fileInput = screen.getByTestId("file")
      const file = new File(["file content"], "test.jpg", { type: "image/jpg" })

      fireEvent.change(fileInput, {
        target: {
          files: [file]
        }
      })

      await waitFor(() => expect(createMock).toHaveBeenCalled())

      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(FormData),
        headers: { noContentType: true }
      }))
    })

    test("Then submitting the form should call updateBill and navigate to Bills", async () => {
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" }
      })
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Train Paris" }
      })
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "100" }
      })
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2024-05-01" }
      })
      fireEvent.change(screen.getByTestId("vat"), {
        target: { value: "20" }
      })
      fireEvent.change(screen.getByTestId("pct"), {
        target: { value: "20" }
      })
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "Billet de train pour mission" }
      })

      const newBillInstance = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })
      newBillInstance.fileUrl = 'https://localhost/bill.jpg'
      newBillInstance.fileName = 'bill.jpg'
      newBillInstance.billId = '1234'

      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", newBillInstance.handleSubmit)

      fireEvent.submit(form)

      await waitFor(() => expect(updateMock).toHaveBeenCalled())

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
    })
  })
})
