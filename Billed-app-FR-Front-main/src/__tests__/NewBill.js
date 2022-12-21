/**
 * @jest-environment jsdom
 */

import {screen, waitFor, within, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event';
import mockStore from "../__mocks__/store";

//import fetch from "node-fetch";
//jest.mock('node-fetch');
window.alert = jest.fn();


describe("Given I am connected as an employee", () => {
  describe("When I am on New Bill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Then, I have a form to create a new bill", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      expect(screen.getByTestId("form-new-bill")).toHaveLength(9);
    });
  });

  describe('When I am on New bill page and submit form', () => {
    test('Then, I have completed form for new bill', () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const expenseType = screen.getByTestId('expense-type')
      userEvent.selectOptions(expenseType, within(expenseType).getByRole('option', {name : 'Restaurants et bars'}))

      const expenseName = screen.getByTestId('expense-name')
      userEvent.type(expenseName,'Restaurant')

      const datePicker = screen.getByTestId('datepicker')
      userEvent.type(datePicker, '20-12-2022')

      const amount = screen.getByTestId('amount')
      userEvent.type(amount, '85')

      const vat = screen.getByTestId('vat')
      userEvent.type(vat, '70')

      const pct = screen.getByTestId('pct')
      userEvent.type(pct, '20')

      const commentary = screen.getByTestId('commentary')
      userEvent.type(commentary, 'test')
    })

    test ('Then I add a file in input file', async () => {
      window.alert.mockClear();
      document.body.innerHTML = NewBillUI()
      const newBillContainer = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))

      let fileType;

      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
      const newBillChangeFile = screen.getByTestId('file')
      newBillChangeFile.addEventListener('click', handleChangeFile)

      fileType = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
      fireEvent.change(newBillChangeFile, { target: { files: [fileType]} });
      userEvent.upload(newBillChangeFile, fileType);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(newBillChangeFile.files[0]).toStrictEqual(fileType);
    
      fileType = new File(['(⌐□_□)'], 'test.jpg', { type: 'image/jpg' });
      fireEvent.change(newBillChangeFile, { target: { files: [fileType]} });
      userEvent.upload(newBillChangeFile, fileType);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(newBillChangeFile.files[0]).toStrictEqual(fileType);

      fileType = new File(['(⌐□_□)'], 'test.jpeg', { type: 'image/jpeg' });
      fireEvent.change(newBillChangeFile, { target: { files: [fileType]} });
      userEvent.upload(newBillChangeFile, fileType);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(newBillChangeFile.files[0]).toStrictEqual(fileType);
    })

    test('Then I want to send my new bill by click on submit button', async () => {
      document.body.innerHTML = NewBillUI()

      window.onNavigate(ROUTES_PATH.NewBill)

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a",
      }))

      const newBillContainer = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const event = {
        preventDefault: jest.fn(),
      }

      const bill = {
        type: 'Transports',
        name: 'Post test',
        amount: '85',
        date: '20-12-2022',
        vat: '70',
        pct: '20',
        commentary: 'Post test',
        fileUrl: 'https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b',
        fileName: 'image Post test',
        status: 'pending'
      }

      const handleSubmit = jest.fn(() => newBillContainer.handleSubmit(event, bill))
      const newBillSubmitButton = screen.getByTestId('submit-button')
      newBillSubmitButton.addEventListener('click', handleSubmit)
      fireEvent.click(newBillSubmitButton)
      expect(handleSubmit).toHaveBeenCalled()
    })

    /*test("fetches messages from an API and fails with 500 message error", async () => {
      jest.spyOn(mockStore, 'bills')

      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )

      Object.defineProperty(
        window,
        'location',
        { value: { hash: ROUTES_PATH['NewBill'] } }
      )
      
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = `<div id="root"></div>`
      router()

      window.onNavigate(ROUTES_PATH.NewBill)

      const newBillContainer = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
    
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      const event = {
        preventDefault: jest.fn(),
      }

      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((event) => newBillContainer.handleSubmit(event))
      form.addEventListener('submit', handleSubmit)   
      fireEvent.submit(form)
      await new Promise(process.nextTick)
    })*/
  })
});
