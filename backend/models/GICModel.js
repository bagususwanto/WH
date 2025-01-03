import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import CostCenter from "./CostCenterModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const GIC = db.define(
  "GIC",
  {
    gicNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    costCenterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CostCenter,
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

CostCenter.hasMany(GIC, { foreignKey: "costCenterId" });
GIC.belongsTo(CostCenter, { foreignKey: "costCenterId" });

// HOOKS
GIC.addHook("afterCreate", async (gic, options) => {
  await LogMaster.create({
    masterType: "GIC",
    masterId: gic.id,
    action: "create",
    changes: JSON.stringify(gic),
    userId: options.userId,
  });
});

GIC.addHook("afterUpdate", async (gic, options) => {
  // Ambil perubahan yang terjadi
  const changes = gic._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = gic.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "GIC",
      masterId: gic.id,
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
      masterType: "GIC",
      masterId: gic.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default GIC;
