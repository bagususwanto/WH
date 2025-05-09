import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";
import Inventory from "./InventoryModel.js";
import DeliveryNote from "./DeliveryNoteModel.js";

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
      allowNull: true,
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Inventory,
        key: "id",
      },
    },
    incomingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logImportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LogImport,
        key: "id",
      },
    },
    deliveryNoteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DeliveryNote,
        key: "id",
      },
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

DeliveryNote.hasMany(Incoming, {
  foreignKey: "deliveryNoteId",
  onDelete: "CASCADE",
});
Incoming.belongsTo(DeliveryNote, {
  foreignKey: "deliveryNoteId",
  onDelete: "CASCADE",
});

export default Incoming;
