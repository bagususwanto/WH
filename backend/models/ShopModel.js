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
    costCenter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wbsNumber: {
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
    ext: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Plant.hasMany(Shop, { foreignKey: "plantId" });
Shop.belongsTo(Plant, { foreignKey: "plantId" });

export default Shop;
