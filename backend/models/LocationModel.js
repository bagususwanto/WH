import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Shop from "./ShopModel.js";

const { DataTypes } = Sequelize;

const Location = db.define(
  "Location",
  {
    locationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Shop,
        key: "id",
      },
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Shop.hasMany(Location, { foreignKey: "shopId" });
Location.belongsTo(Shop, { foreignKey: "shopId" });

export default Location;
