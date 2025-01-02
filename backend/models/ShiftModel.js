import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Shift = db.define(
  "Shift",
  {
    shiftCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shiftName: {
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
Shift.addHook("afterCreate", async (shift, options) => {
  await LogMaster.create({
    masterType: "Shift",
    masterId: shift.id,
    action: "create",
    changes: JSON.stringify(shift),
    userId: options.userId,
  });
});

Shift.addHook("afterUpdate", async (shift, options) => {
  // Ambil perubahan yang terjadi
  const changes = shift._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = shift.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Shift",
      masterId: shift.id,
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
      masterType: "Shift",
      masterId: shift.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Shift;
