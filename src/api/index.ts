import axios from "axios"
import { ReserveEquipment } from "@/models/types"

export default class Api {
  static async getUser(): Promise<any> {
    return await axios.get("user")
  }

  static async getEquipById(equipId: number): Promise<any> {
    return await axios.get(`equipment/${equipId}`)
  }

  static async getRsvnByEquipId(equipId: number): Promise<any> {
    // TODO limit fetch data number
    return await axios.get(`reservation/equipment?equipId=${equipId}`)
  }

  static async createRsvn(params: ReserveEquipment): Promise <any> {
    console.log(params)
    return await axios.post("reservation/equipment", params)
  }
}