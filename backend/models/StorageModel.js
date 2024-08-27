import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Shop from "./ShopModel.js";

const { DataTypes } = Sequelize;

const Storage = db.define(
  "Storage",
  {
    storageName: {
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
      defaultValue:1,
    },
  },
  {
    freezeTableName: true,
  }
);

Shop.hasMany(Storage, { foreignKey: "shopId" });
Storage.belongsTo(Shop, { foreignKey: "shopId" });

export default Storage;
