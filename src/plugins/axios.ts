import axios from "axios"
import { authStore } from "@/store"
// FIX ME
const responseHandler = (res: any) => res
const responseErrorHandler = (err: any) => {
  if (err.response.status == 401 && authStore.isLogin) authStore.logout()
  return Promise.reject(err)
}

console.log(process.env)

axios.defaults.baseURL = process.env.NODE_ENV === "production"
  ? "https://fibergroup.herokuapp.com/api/"
  : "http://localhost:8000/api/"
axios.defaults.withCredentials = true
axios.interceptors.response.use(responseHandler, responseErrorHandler)

export default axios