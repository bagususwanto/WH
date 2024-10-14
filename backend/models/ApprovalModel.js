import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Order from "./OrderModel.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const Approval = db.define(
  "Approval",
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Order.hasMany(Approval, { foreignKey: "storageId" });
Approval.belongsTo(Order, { foreignKey: "storageId" });

User.hasMany(Approval, { foreignKey: "userId" });
Approval.belongsTo(User, { foreignKey: "userId" });

export default Approval;
