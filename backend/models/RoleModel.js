import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Role = db.define(
  "Role",
  {
    roleName: {
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
Role.addHook("afterCreate", async (role, options) => {
  await LogMaster.create({
    masterType: "Role",
    masterId: role.id,
    action: "create",
    changes: JSON.stringify(role),
    userId: options.userId,
  });
});

Role.addHook("afterUpdate", async (role, options) => {
  // Ambil perubahan yang terjadi
  const changes = role._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = role.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Role",
      masterId: role.id,
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
      masterType: "Role",
      masterId: role.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Role;
