import { 
  User,
  Equipment,
  EquipmentReservation
} from "./types"

import { AUTH_ID_TO_NAME } from "@/plugins/utils"

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

export class EquipmentInfo {
  id: number
  name: string
  status: number
  imgsrc: string
  userId: number

  constructor(obj: Equipment){
    this.id = obj.Id
    this.name = obj.Name
    this.status = obj.Status
    this.imgsrc = obj.Url
    this.userId = obj.userId
  }
} 

export class EquipmentRsvnInfo {
  id: number
  userId: number
  equipId: number
  status: number
  start: Date
  end: Date


  constructor(obj: EquipmentReservation){
    this.id = obj.Id
    this.userId = obj.UserId
    this.equipId = obj.EquipId
    this.status = obj.Status
    this.start = new Date(obj.StartDate)
    this.end = new Date(obj.EndDate)
  }
} 