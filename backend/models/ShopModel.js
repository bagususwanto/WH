import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Plant from "./PlantModel.js";

const { DataTypes } = Sequelize;

const Shop = db.define(
  "Shop",
  {
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Plant,
        key: "Id",
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

Plant.hasMany(Shop, { foreignKey: "plantId" });
Shop.belongsTo(Plant, { foreignKey: "plantId" });

export default Shop;
