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
    totalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
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

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

export default Order;
