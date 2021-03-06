import axios from "axios"
import {
  LoginInfo,
  UserCreate,
  UserUpdate,
  EquipmentReservationUpdate,
  EquipmentCreate,
  EquipmentUpdate,
  EquipmentStautsUpdate
} from "@/models/types"

export default class Api {
  static async login(params: LoginInfo) {
    return await axios.post("auth", params)
  }

  static async logout() {
    return axios.get("auth/logout")
  }

  static async getUser(): Promise<any> {
    return await axios.get("user")
  }

  static async createUser(params: UserCreate): Promise<any> {
    return await axios.post("user", params)
  }

  static async updateUser(params: UserUpdate): Promise<any> {
    return await axios.put(`user/${params.id}`, params)
  }

  static async getEquips(): Promise<any> {
    return await axios.get("equipment")
  }

  static async getEquipById(equipId: number): Promise<any> {
    return await axios.get(`equipment/${equipId}`)
  }

  static async createEquip(params: EquipmentCreate): Promise<any> {
    return await axios.post("equipment", params)
  }

  static async updateEquip(params: EquipmentUpdate): Promise<any> {
    return await axios.put(`equipment/${params.id}`, params)
      .catch((e) => console.log({e}))
  }

  static async updateEquipStatus(params: EquipmentStautsUpdate): Promise<any> {
    return await axios.post(`equipment/${params.equipId}/status`, params)
  }

  static async deleteEquip(id: number): Promise<any> {
    return await axios.delete(`equipment/${id}`)
  }

  static async generateEquipQR(equipId: number): Promise<any> {
    return await axios.get(`equipment/${equipId}/qrcode`)
  }

  static async getRsvn(): Promise<any> {
    return await axios.get(`reservation`)
  }

  static async getRsvnByEquipId(equipId: number): Promise<any> {
    // TODO limit fetch data number
    return await axios.get(`reservation/equipment?equipId=${equipId}`)
  }

  static async createRsvn(params: EquipmentReservationUpdate[]): Promise <any> {
    return await axios.post("reservation/equipment", params)
  }

  static async updateRsvn(params: EquipmentReservationUpdate): Promise <any> {
    if(!params.id) return Promise.reject()
    return await axios.put(`reservation/equipment/${params.id}`, params)
  }

  static async deleteRsvn(rsvnId: number): Promise <any> {
    if(!rsvnId) return Promise.reject()
    return await axios.delete(`reservation/equipment/${rsvnId}`)
  }
}