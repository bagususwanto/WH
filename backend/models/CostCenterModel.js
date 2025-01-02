import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const CostCenter = db.define(
  "Cost_Center",
  {
    costCenter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    costCenterName: {
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
CostCenter.addHook("afterCreate", async (cc, options) => {
  await LogMaster.create({
    masterType: "CostCenter",
    masterId: cc.id,
    action: "create",
    changes: JSON.stringify(cc),
    userId: options.userId,
  });
});

CostCenter.addHook("afterUpdate", async (cc, options) => {
  // Ambil perubahan yang terjadi
  const changes = cc._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = cc.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "CostCenter",
      masterId: cc.id,
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
      masterType: "CostCenter",
      masterId: cc.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default CostCenter;
