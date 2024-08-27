import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Shop from "./ShopModel.js";
import Role from "./RoleModel.js";
import CostCenter from "./CostCenterModel.js";

const { DataTypes } = Sequelize;

const User = db.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    costCenterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CostCenter,
        key: "id",
      },
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
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

CostCenter.hasMany(User, { foreignKey: "costCenterId" });
User.belongsTo(CostCenter, { foreignKey: "costCenterId" });

Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

export default User;
