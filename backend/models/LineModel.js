import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Line = db.define(
  "Line",
  {
    lineName: {
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
Line.addHook("afterCreate", async (line, options) => {
  await LogMaster.create({
    masterType: "Line",
    masterId: line.id,
    action: "create",
    changes: JSON.stringify(line),
    userId: options.userId,
  });
});

Line.addHook("afterUpdate", async (line, options) => {
  // Ambil perubahan yang terjadi
  const changes = line._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = line.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Line",
      masterId: line.id,
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
      masterType: "Line",
      masterId: line.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Line;
