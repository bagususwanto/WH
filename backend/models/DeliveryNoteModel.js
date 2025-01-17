import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";

const { DataTypes } = Sequelize;

const DeliveryNote = db.define(
  "Delivery_Note",
  {
    dnNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arrivalPlanDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    arrivalPlanTime: {
      type: DataTypes.TIME,
      allowNull: false,
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
      allowNull: false,
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

export default DeliveryNote;
