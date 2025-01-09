import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import Warehouse from "./WarehouseModel.js";
import LogMaster from "./LogMasterModel.js";

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

Warehouse.belongsToMany(User, {
  through: UserWarehouse,
  foreignKey: "warehouseId",
});
User.belongsToMany(Warehouse, { through: UserWarehouse, foreignKey: "userId" });

// HOOKS
UserWarehouse.addHook("afterCreate", async (uw, options) => {
  const masterId = `${uw.userId}-${uw.warehouseId}`; // Gabungkan userId dan warehouseId

  await LogMaster.create({
    masterType: "UserWarehouse",
    masterId: masterId, // Gunakan masterId yang baru
    action: "create",
    changes: JSON.stringify(uw),
    userId: options.userId,
  });
});

UserWarehouse.addHook("afterUpdate", async (uw, options) => {
  const masterId = `${uw.userId}-${uw.warehouseId}`; // Gabungkan userId dan warehouseId

  const changes = uw._previousDataValues;
  const updatedData = uw.dataValues;

  if (changes.flag === 1 && updatedData.flag === 0) {
    await LogMaster.create({
      masterType: "UserWarehouse",
      masterId: masterId, // Gunakan masterId yang baru
      action: "softDelete",
      changes: JSON.stringify({
        old: changes,
        new: updatedData,
      }),
      userId: options.userId,
    });
  } else {
    await LogMaster.create({
      masterType: "UserWarehouse",
      masterId: masterId, // Gunakan masterId yang baru
      action: "update",
      changes: JSON.stringify({
        old: changes,
        new: updatedData,
      }),
      userId: options.userId,
    });
  }
});

export default UserWarehouse;
