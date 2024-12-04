import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import Order from "./OrderModel.js";

const { DataTypes } = Sequelize;

const OrderHistory = db.define(
  "Order_History",
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Order.hasMany(OrderHistory, { foreignKey: "orderId", onDelete: "NO ACTION" });
OrderHistory.belongsTo(Order, { foreignKey: "orderId", onDelete: "NO ACTION" });

User.hasMany(OrderHistory, { foreignKey: "userId", onDelete: "NO ACTION" });
OrderHistory.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

export default OrderHistory;
