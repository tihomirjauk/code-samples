import { ID } from "core";

export default class BaseModel {
  static defaults() {
    return { id: null };
  }

  static hasMany() {
    return {};
  }

  static create(data = null) {
    if (data) {
      const merged = { ...this.defaults(), ...data };
      const collections = this.hasMany();

      Object.keys(collections).forEach((key) => {
        const modelClass = collections[key];
        merged[key] = merged[key].map((item) => {
          return modelClass.create(item);
        });
      });

      if (merged.id > 0) {
      } else {
        merged.id = ID.next();
      }
      return merged;
    } else {
      return { ...this.defaults() };
    }
  }
}
