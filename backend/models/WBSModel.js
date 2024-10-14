import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const WBS = db.define(
  "WBS",
  {
    wbsNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wbsYear: {
      type: DataTypes.INTEGER,
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

export default WBS;
