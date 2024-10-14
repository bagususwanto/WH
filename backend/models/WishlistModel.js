import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import Inventory from "./InventoryModel.js";

const { DataTypes } = Sequelize;

const Wishlist = db.define(
  "Wishlist",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Inventory,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Inventory.hasMany(Wishlist, { foreignKey: "inventoryId" });
Wishlist.belongsTo(Inventory, { foreignKey: "inventoryId" });

export default Wishlist;
