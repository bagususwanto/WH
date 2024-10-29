import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Warehouse from "./WarehouseModel.js";

const { DataTypes } = Sequelize;

const Plant = db.define(
  "Plant",
  {
    plantCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
        key: "id",
      },
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

Warehouse.hasMany(Plant, { foreignKey: "warehouseId" });
Plant.belongsTo(Warehouse, { foreignKey: "warehouseId" });

export default Plant;
