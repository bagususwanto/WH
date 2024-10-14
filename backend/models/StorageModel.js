import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Plant from "./PlantModel.js";

const { DataTypes } = Sequelize;

const Storage = db.define(
  "Storage",
  {
    storageCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    storageName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Plant,
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

Plant.hasMany(Storage, { foreignKey: "plantId" });
Storage.belongsTo(Plant, { foreignKey: "plantId" });

export default Storage;
