import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Warehouse = db.define(
  "Warehouse",
  {
    warehouseCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    warehouseName: {
      type: DataTypes.STRING,
      allowNull: false,
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

// HOOKS
Warehouse.addHook("afterCreate", async (warehouse, options) => {
  await LogMaster.create({
    masterType: "Warehouse",
    masterId: warehouse.id,
    action: "create",
    changes: JSON.stringify(warehouse),
    userId: options.userId,
  });
});

Warehouse.addHook("afterUpdate", async (warehouse, options) => {
  // Ambil perubahan yang terjadi
  const changes = warehouse._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = warehouse.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Warehouse",
      masterId: warehouse.id,
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
      masterType: "Warehouse",
      masterId: warehouse.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Warehouse;
