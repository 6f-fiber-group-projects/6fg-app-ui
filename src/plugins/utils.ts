import { authStore } from "@/store"

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const AUTH_ID_TO_NAME: {[n: number]: string} = {
  1: "admin",
  2: "editor",
  3: "viewer"
}

export const isAdmin = () => {
  return authStore.getUserInfo?.auth === "admin"
}

export const isLoginUser = (userId: number) => {
  return authStore.getUserInfo?.id === userId
}