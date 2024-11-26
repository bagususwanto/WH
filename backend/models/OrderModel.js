import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const Order = db.define(
  "Order",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    requestNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scheduleDelivery: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    currentRoleApprovalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isLastApproval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isApproval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isMoreThanCertainPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

export default Order;
