import axios from "axios"

export default class Api {
  static async getUser(): Promise<any> {
    return await axios("user")
  }

  static async getEquipById(equipId: number): Promise<any> {
    return await axios(`equipment/${equipId}`)
  }

  static async getRsvnByEquipId(equipId: number): Promise<any> {
    // TODO limit fetch data number
    return await axios(`reservation/equipment?equipId=${equipId}`)
  }
}