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
    arrivalPlanDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    arrivalPlanTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    arrivalActualDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    arrivalActualTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    departurePlanDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    departurePlanTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    departureActualDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    departureActualTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    truckStation: {
      type: DataTypes.STRING,
      allowNull: true,
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
