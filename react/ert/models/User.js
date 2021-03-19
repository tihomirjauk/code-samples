import BaseModel from "./BaseModel";

export default class User extends BaseModel {
  static defaults() {
    return {
      _type: "User",
      id: null,
      created_at: null,
      updated_at: null,
      name: "",
      email: "",
      email_verified_at: null,
      role: "",
      permissions: []
    };
  }
}
