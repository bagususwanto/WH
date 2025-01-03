import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const WBS = db.define(
  "WBS",
  {
    wbsNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wbsYear: {
      type: DataTypes.INTEGER,
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
WBS.addHook("afterCreate", async (wbs, options) => {
  await LogMaster.create({
    masterType: "WBS",
    masterId: wbs.id,
    action: "create",
    changes: JSON.stringify(wbs),
    userId: options.userId,
  });
});

WBS.addHook("afterUpdate", async (wbs, options) => {
  // Ambil perubahan yang terjadi
  const changes = wbs._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = wbs.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "WBS",
      masterId: wbs.id,
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
      masterType: "WBS",
      masterId: wbs.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default WBS;
