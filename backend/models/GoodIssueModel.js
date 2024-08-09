import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const GoodIssue = db.define(
  "Good_Issue",
  {
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
      allowNull: true,
    },
    approvalWarehouse: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    userIdApprovalWarehouse: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(GoodIssue, { foreignKey: "userIdRecipent" });
GoodIssue.belongsTo(User, { foreignKey: "userIdRecipent" });

export default GoodIssue;
