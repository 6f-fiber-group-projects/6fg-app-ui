import _ from "lodash"
import {
  authStore,
  userStore
} from "@/store"

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const AUTH_ID_TO_NAME: {[n: number]: string} = {
  1: "admin",
  2: "editor",
  3: "viewer"
}

export const authNameToId = (n: string) => {
  const id = _.findKey(AUTH_ID_TO_NAME, o => o === n)
  return id && parseInt(id)
}

export const isAdmin = () => {
  return authStore.getUserInfo?.auth === "admin"
}

export const isLoginUser = (userId: number) => {
  return authStore.getUserInfo?.id === userId
}

export const getUserByName =  (userName: string) => {
  return _.find(userStore.getUsers, (u) => u.name === userName)
}

export const existSameUserName = (userId: number, userName: string) => {
  const user1 = userStore.getUserById(userId)
  const user2 = getUserByName(userName)
  if(user1) return user2 !== undefined && user1.name !== user2.name
  return user2 !== undefined
}

export const getUserByEmail =  (email: string) => {
  return _.find(userStore.getUsers, (u) => u.email === email)
}

export const existSameUserEmail = (userId: number, userEmail: string) => {
  const user1 = userStore.getUserById(userId)
  const user2 = getUserByEmail(userEmail)
  if(user1) return user2 !== undefined && user1.email !== user2.email
  return user2 !== undefined
}

export const validatePassword = (s: string) => {
  return s.length > 8 && s.match(/^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*[0-9]+)(?=.*[!"#$%&\-^¥\\@;:/<>+*{}[\]|~=]).*$/) != null
}