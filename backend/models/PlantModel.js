import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

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
  },
  {
    freezeTableName: true,
  }
);

export default Plant;
