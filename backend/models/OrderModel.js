import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import GoodIssue from "./GoodIssueModel.js";

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

// User.hasMany(Order, { foreignKey: "userId" });
// Order.belongsTo(User, { foreignKey: "userId" });

// Order.belongsTo(GoodIssue, { foreignKey: "goodIssueId" });
// GoodIssue.hasOne(Order, { foreignKey: "goodIssueId" });

export default Order;
