/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from '@testing-library/user-event';

jest.mock("../app/store", () => mockStore)

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
      //to-do write expect expression
      expect(windowIcon).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => a.date - b.date;
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'Error' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I am on Bills', () => {
    test('Then, I have bills', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      expect(screen.getAllByTestId('tbody')).toHaveLength(1)
    })
  })

  describe('When I am on Bills page and click on the new bill button', () => {
    test('should open new bill on click', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const billsContainer = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: { bills } })

      const handleNewBill = jest.fn(() => billsContainer.handleClickNewBill())
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleNewBill)

      expect(screen.getByTestId('content-title').innerHTML).toBe(' Mes notes de frais ')

      userEvent.click(newBillButton)
      expect(handleNewBill).toHaveBeenCalled()
      expect(screen.getByTestId('content-title').innerHTML).toBe(' Envoyer une note de frais ')

    })
  })
  
  describe("When I click on the 'Eye' Icon of a bill", () => {
    test("Then the bill should be shown in a modal", () => {
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

      document.body.innerHTML = BillsUI({ data: bills });

      const container = new Bills({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      })

      document.body.innerHTML = BillsUI({ data: bills });
      $.fn.modal = jest.fn();

      const iconEyeBtn = screen.getAllByTestId("icon-eye")[0];
      const modalTrigger = jest.fn(container.handleClickIconEye);
      iconEyeBtn.addEventListener("click", () => {modalTrigger(iconEyeBtn);});

      userEvent.click(iconEyeBtn);
      expect(modalTrigger).toHaveBeenCalled();
      expect($.fn.modal).toHaveBeenCalledWith("show");

      const modal = screen.getByTestId("modaleFile");
      expect(modal).toBeTruthy();

      const modalTitle = screen.getByText("Justificatif");
      expect(modalTitle).toBeTruthy();

      const modalImageUrl = iconEyeBtn.getAttribute("data-bill-url").split("?")[0];
      expect(modal.innerHTML.includes(modalImageUrl)).toBeTruthy();
    })
  })
})
