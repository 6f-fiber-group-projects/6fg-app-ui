import { UserInfo } from "@/models"

export type LoginInfo = {
  email: string
  password: string
}

export type User = {
  id: number
  auth_id: number
	google_id?: number
	name: string
	email: string
}

export type UserCreate = {
	name: string
  email: string
  password: string
}

export type UserUpdate = {
  id: number
	name: string
  email: string
  password: string
  authId: number
}

export type Equipment = {
  Id: number
  Name: string
  Status: number
  UserId: number
	Url: string
}

export type EquipmentCreate = {
  name: string;
}

export type EquipmentUpdate = {
  id: number;
  name: string;
  status: number;
}

export type EquipmentStautsUpdate = {
  equipId: number
  equipStatus?: number
  userId: number
  rsvnId?: number
}

export type EquipmentReservation = {
  Id: number
  UserId: number
  EquipId: number
  Status: number
  StartDate: string
  EndDate: string
}

export type EquipmentReservationUpdate = {
  id?: number
  userId: number
  equipId: number
  startDate: Date
  endDate: Date
}

export type CalendarEvent = {
  rsvnId: number;
  name: string;
  start: Date;
  end: Date;
  color: string;
  user: UserInfo;
}