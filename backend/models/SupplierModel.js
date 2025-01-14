import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Supplier = db.define(
  "Supplier",
  {
    supplierCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supplierName: {
      type: DataTypes.STRING,
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

LogImport.hasMany(Supplier, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
Supplier.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

Supplier.addHook("afterCreate", async (supplier, options) => {
  await LogMaster.create({
    masterType: "Supplier",
    masterId: supplier.id,
    action: "create",
    changes: JSON.stringify(supplier),
    userId: options.userId,
  });
});

Supplier.addHook("afterUpdate", async (supplier, options) => {
  // Ambil perubahan yang terjadi
  const changes = supplier._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = supplier.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Supplier",
      masterId: supplier.id,
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
      masterType: "Supplier",
      masterId: supplier.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Supplier;
