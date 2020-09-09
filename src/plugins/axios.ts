import axios from "axios"
import { authStore } from "@/store"
// FIX ME
let loggingOut = false
const responseHandler = (res: any) => {
  loggingOut = false
  return res
}
const responseErrorHandler = (err: any) => {
  if (err.response.status == 401 && loggingOut) {
    authStore.logout()
    loggingOut = true
  }
  return Promise.reject(err)
}

axios.defaults.baseURL = process.env.NODE_ENV === "production"
  ? "https://aqueous-hollows-30635.herokuapp.com/"
  : "http://localhost:8000/"
axios.defaults.withCredentials = true
axios.interceptors.response.use(responseHandler, responseErrorHandler)

export default axios