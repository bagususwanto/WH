import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const LogImport = db.define(
  "Log_Import",
  {
    typeLog: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    importDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(LogImport, { foreignKey: "userId" });
LogImport.belongsTo(User, { foreignKey: "userId" });

export default LogImport;
