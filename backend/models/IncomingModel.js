import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";
import Inventory from "./InventoryModel.js";

const { DataTypes } = Sequelize;

const Incoming = db.define(
  "Incoming",
  {
    planning: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Inventory,
        key: "id",
      },
    },
    logImportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LogImport,
        key: "id",
      },
    },
    incomingDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

LogImport.hasMany(Incoming, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
Incoming.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

Inventory.hasMany(Incoming, {
  foreignKey: "inventoryId",
  onDelete: "NO ACTION",
});
Incoming.belongsTo(Inventory, {
  foreignKey: "inventoryId",
  onDelete: "NO ACTION",
});

export default Incoming;
