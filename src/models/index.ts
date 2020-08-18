import { User } from "./types"

const AUTH_ID_TO_NAME: {[n: number]: string} = {
  1: "admin",
  2: "editor",
  3: "viewer"
}

export class UserInfo {
  id: number
  name: string
  email: string
  auth: string

  constructor(u: User){
    this.id = u.id
    this.name = u.name
    this.email = u.email
    this.auth = AUTH_ID_TO_NAME[u.auth_id]
  }
} 

export class Notification {
  id!: number
  msg!: string
  type!: string
  timeout!: number

  constructor(obj: Notification){
    Object.assign(this, obj)
  }
} 