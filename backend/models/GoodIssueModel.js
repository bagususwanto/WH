import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const GoodIssue = db.define(
  "Good_Issue",
  {
    userIdRecipient: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    approvalLHStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
    },
    userIdApprovalLH: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
      references: {
        model: User,
        key: "id",
      },
    },
    approvalWarehouseStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
    },
    userIdApprovalWarehouse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
      references: {
        model: User,
        key: "id",
      },
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(GoodIssue, { foreignKey: "userIdRecipient" });
GoodIssue.belongsTo(User, { foreignKey: "userIdRecipient" });

export default GoodIssue;
