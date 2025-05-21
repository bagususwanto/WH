import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";
import Supplier from "./SupplierModel.js";

const { DataTypes } = Sequelize;

const DeliveryNote = db.define(
  "Delivery_Note",
  {
    dnNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    deliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    completeItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Supplier,
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

Supplier.hasMany(DeliveryNote, {
  foreignKey: "supplierId",
});
DeliveryNote.belongsTo(Supplier, {
  foreignKey: "supplierId",
});

export default DeliveryNote;
