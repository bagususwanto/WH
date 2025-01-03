import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Packaging = db.define(
  "Packaging",
  {
    packaging: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unitPackaging: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    logImportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LogImport,
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

LogImport.hasMany(Packaging, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
Packaging.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

// HOOKS
Packaging.addHook("afterCreate", async (packaging, options) => {
  await LogMaster.create({
    masterType: "Packaging",
    masterId: packaging.id,
    action: "create",
    changes: JSON.stringify(packaging),
    userId: options.userId,
  });
});

Packaging.addHook("afterUpdate", async (packaging, options) => {
  // Ambil perubahan yang terjadi
  const changes = packaging._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = packaging.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Packaging",
      masterId: packaging.id,
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
      masterType: "Packaging",
      masterId: packaging.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Packaging;
