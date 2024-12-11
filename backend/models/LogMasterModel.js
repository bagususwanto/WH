import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const LogMaster = db.define(
  "Log_Master",
  {
    masterType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    masterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    changes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(LogMaster, { foreignKey: "userId", onDelete: "NO ACTION" });
LogMaster.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

export default LogMaster;
