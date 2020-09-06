import axios from "axios"
import { ReserveEquipment } from "@/models/types"

export default class Api {
  static async getUser(): Promise<any> {
    return await axios.get("user")
  }

  static async getEquipById(equipId: number): Promise<any> {
    return await axios.get(`equipment/${equipId}`)
  }

  static async createEquip(name: string): Promise<any> {
    return await axios.post(`equipment`, {name})
  }

  static async getRsvnByEquipId(equipId: number): Promise<any> {
    // TODO limit fetch data number
    return await axios.get(`reservation/equipment?equipId=${equipId}`)
  }

  static async createRsvn(params: ReserveEquipment): Promise <any> {
    return await axios.post("reservation/equipment", params)
  }

  static async updateRsvn(params: ReserveEquipment): Promise <any> {
    if(!params.id) return Promise.reject()
    return await axios.put(`reservation/equipment/${params.id}`, params)
  }

  static async deleteRsvn(params: {id: number}): Promise <any> {
    if(!params.id) return Promise.reject()
    return await axios.delete(`reservation/equipment/${params.id}`)
  }
}