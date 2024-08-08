import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import Order from "./OrderModel.js";

const { DataTypes } = Sequelize;

const GoodIssue = db.define(
  "Good_Issue",
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    userIdRecipent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    approvalLH: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    userIdApprovalLH: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approvalWarehouse: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    userIdApprovalWarehouse: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(GoodIssue, { foreignKey: "userIdRecipent" });
GoodIssue.belongsTo(User, { foreignKey: "userIdRecipent" });

Order.hasMany(GoodIssue, { foreignKey: "orderId" });
GoodIssue.belongsTo(Order, { foreignKey: "orderId" });

export default GoodIssue;
