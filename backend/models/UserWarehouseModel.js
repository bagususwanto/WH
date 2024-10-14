import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import Warehouse from "./WarehouseModel.js";

const { DataTypes } = Sequelize;

const UserWarehouse = db.define(
  "User_Warehouse",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
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

Warehouse.belongsToMany(User, { through: UserWarehouse, foreignKey: "warehouseId" });
User.belongsToMany(Warehouse, { through: UserWarehouse, foreignKey: "userId" });

export default UserWarehouse;
