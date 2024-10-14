import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const CostCenter = db.define(
  "Cost_Center",
  {
    costCenter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    costCenterName: {
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

export default CostCenter;
