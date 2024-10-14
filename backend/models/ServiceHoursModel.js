import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Warehouse from "./WarehouseModel.js";
import Shift from "./ShiftModel.js";

const { DataTypes } = Sequelize;

const ServiceHours = db.define(
  "Service_Hours",
  {
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
        key: "id",
      },
    },
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Shift,
        key: "id",
      },
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
  }
);

Warehouse.hasMany(ServiceHours, { foreignKey: "warehouseId" });
ServiceHours.belongsTo(Warehouse, { foreignKey: "warehouseId" });

Shift.hasMany(ServiceHours, { foreignKey: "shiftId" });
ServiceHours.belongsTo(Shift, { foreignKey: "shiftId" });

export default ServiceHours;
