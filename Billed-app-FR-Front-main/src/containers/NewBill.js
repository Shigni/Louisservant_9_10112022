import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const fileType = fileName.split('.').slice(-1)[0]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    /*ADDED From Bug Hunt - Bills =
    Check the extention of the file
    TO DO : Après un mauvais fichier la page ne reload pas, si remplacer par un bon fichier image upload mais ne reload pas*/
    const fileExtentionTest = () => {
      if(["png", "jpeg", "jpg"].includes(fileType))
        return true
      
        return false
      }

    const isFileValid = fileExtentionTest()
    if(isFileValid){
      this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
      this.document.getElementById('btn-send-bill').type = "submit"
    } else {
      alert('Veuillez choisir un fichier du type .png, .jpg ou .jpeg')
      this.document.getElementById('btn-send-bill').type = "button"
    }
  }

  handleSubmit = (e, testBills = {}) => {
    e.preventDefault()


    let bill = {}
    if(e.target) {
      const email = JSON.parse(localStorage.getItem("user")).email
      const type = e.target.querySelector(`select[data-testid="expense-type"]`).value
      const name  = e.target.querySelector(`input[data-testid="expense-name"]`).value
      const amount = parseInt(e.target.querySelector(`input[data-testid="amount"]`).value)
      const date = e.target.querySelector(`input[data-testid="datepicker"]`).value
      const vat = e.target.querySelector(`input[data-testid="vat"]`).value
      const pct = parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20
      const commentary = e.target.querySelector(`textarea[data-testid="commentary"]`).value
      const fileUrl = this.fileUrl
      const fileName = this.fileName
      const status = 'pending'

      bill = {
        email,
        type,
        name,
        amount,
        date,
        vat,
        pct,
        commentary,
        fileUrl,
        fileName,
        status
      }
    } else {
      bill = testBills
    }
    
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }


  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}