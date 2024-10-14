import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const Warehouse = db.define(
  "Warehouse",
  {
    warehouseCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    warehouseName: {
      type: DataTypes.STRING,
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

export default Warehouse;
