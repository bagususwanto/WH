import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const Supplier = db.define(
  "Supplier",
  {
    supplierName: {
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

export default Supplier;
