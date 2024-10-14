import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Order from "./OrderModel.js";
import Inventory from "./InventoryModel.js";

const { DataTypes } = Sequelize;

const DetailOrder = db.define(
  "Detail_Order",
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isReject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

Order.hasMany(DetailOrder, { foreignKey: "orderId" });
DetailOrder.belongsTo(Order, { foreignKey: "orderId" });

Inventory.hasMany(DetailOrder, { foreignKey: "inventoryId" });
DetailOrder.belongsTo(Inventory, { foreignKey: "inventoryId" });

export default DetailOrder;
