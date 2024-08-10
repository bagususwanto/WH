import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const Plant = db.define(
  "Plant",
  {
    plantCode: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    plantName: {
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

export default Plant;
