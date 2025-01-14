import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";
import Inventory from "./InventoryModel.js";
import DeliverySchedule from "./DeliverySchedule.js";

const { DataTypes } = Sequelize;

const DeliveryNote = db.define(
  "Delivery_Note",
  {
    dnNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arrivalAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    departureAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DeliverySchedule,
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
  },
  {
    freezeTableName: true,
  }
);

LogImport.hasMany(DeliveryNote, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
DeliveryNote.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

DeliverySchedule.hasMany(DeliveryNote, {
  foreignKey: "deliveryScheduleId",
  onDelete: "NO ACTION",
});
DeliveryNote.belongsTo(DeliverySchedule, {
  foreignKey: "deliveryScheduleId",
  onDelete: "NO ACTION",
});

export default DeliveryNote;
