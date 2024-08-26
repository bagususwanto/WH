import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import GoodIssue from "./GoodIssueModel.js";

const { DataTypes } = Sequelize;

const Order = db.define(
  "Order",
  {
    totalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    goodIssueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GoodIssue,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);


Order.belongsTo(GoodIssue, { foreignKey: "goodIssueId" });
GoodIssue.hasOne(Order, { foreignKey: "goodIssueId" });

export default Order;
