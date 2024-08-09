import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Shop from "./ShopModel.js";
import Role from "./RoleModel.js";

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
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Shop,
        key: "id",
      },
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Shop.hasMany(User, { foreignKey: "shopId" });
User.belongsTo(Shop, { foreignKey: "shopId" });

Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

export default User;
