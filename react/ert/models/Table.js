import BaseModel from "./BaseModel";
import Column from "./Column";
import Prediction from "./Prediction";

import { Store } from "core";

export default class Table extends BaseModel {
  static defaults() {
    return {
      _type: "Table",
      id: null,
      index: null,
      name: "",
      description: "",
      columns: [],
      //
      position: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      //
      predictions: [],
    };
  }
  static hasMany() {
    return {
      columns: Column,
      predictions: Prediction,
    };
  }

  // indexing
  static _indexed = {};
  static createIndex(name) {
    if (name === "findById") {
      this._indexed[name] = {};
      const { tables } = Store.get("app.project.schema");
      tables.forEach((table, index) => {
        this._indexed[name][table.id] = index;
      });
    }
  }
  static destroyIndex(name) {
    delete this._indexed[name];
  }

  // helper methods
  static findById(id) {
    const { tables } = Store.get("app.project.schema");
    if (this._indexed["findById"]) {
      const index = this._indexed["findById"][id];
      return tables[index];
    }
    let found = {};
    tables.forEach((table) => {
      if (table.id === id) {
        found = table;
      }
    });
    return found;
  }

  static findIndexById(id) {
    const { tables } = Store.get("app.project.schema");
    if (this._indexed["findById"]) {
      return this._indexed["findById"][id];
    }
    let found = null;
    tables.forEach((table, index) => {
      if (table.id === id) {
        found = index;
      }
    });
    return found;
  }

  static findByName(name) {
    const { tables } = Store.get("app.project.schema");
    let found = {};
    tables.forEach((table) => {
      if (table.name && table.name.toLowerCase() === name.toLowerCase()) {
        found = table;
      }
    });
    return found;
  }

  static remove(tableId) {
    const app = Store.get("app");
    app.project.schema.tables = app.project.schema.tables.filter(
      (i) => i.id !== tableId
    );
    //
    app.project.schema["connections"] = app.project.schema[
      "connections"
    ].filter((c) => {
      const ids = c.pair;
      return !ids.includes(tableId);
    });
    // @todo also delete connections and foreign keys for deleted tables

    //
    Store.set("app", app);
  }

  static options() {
    const { tables } = Store.get("app.project.schema");
    return tables.map((table) => {
      return { value: table.id, label: table.name };
    });
  }
}
