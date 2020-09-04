import { UserInfo } from "@/models"

export type User = {
  id: number
  auth_id: number
	google_id: number
	name: string
	email: string
}

export type Equipment = {
  Id: number
  Name: string
	Status: number
	Url: string
}

export type EquipmentReservation = {
  Id: number
  UserId: number
  EquipId: number
  Status: number
  StartDate: string
  EndDate: string
}

export type CalendarEvent = {
  name: string;
  start: Date;
  end: Date;
  color: string;
  user: UserInfo;
}