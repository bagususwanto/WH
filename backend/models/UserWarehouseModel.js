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

Warehouse.belongsToMany(User, { through: UserWarehouse, foreignKey: "warehouseId" });
User.belongsToMany(Warehouse, { through: UserWarehouse, foreignKey: "userId" });

// HOOKS
UserWarehouse.addHook("afterCreate", async (uw, options) => {
  await LogMaster.create({
    masterType: "UserWarehouse",
    masterId: uw.id,
    action: "create",
    changes: JSON.stringify(uw),
    userId: options.userId,
  });
});

UserWarehouse.addHook("afterUpdate", async (uw, options) => {
  // Ambil perubahan yang terjadi
  const changes = uw._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = uw.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "UserWarehouse",
      masterId: uw.id,
      action: "softDelete",
      changes: JSON.stringify({
        old: changes,
        new: updatedData, // Menyertakan data setelah update
      }),
      userId: options.userId,
    });
  } else {
    // Catat log untuk update biasa
    await LogMaster.create({
      masterType: "UserWarehouse",
      masterId: uw.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default UserWarehouse;
