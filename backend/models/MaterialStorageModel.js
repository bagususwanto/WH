import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Storage from "./StorageModel.js";
import Material from "./MaterialModel.js";
import LogImport from "./LogImportModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const MaterialStorage = db.define(
  "Material_Storage",
  {
    storageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Storage,
        key: "id",
      },
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Material,
        key: "id",
      },
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

Storage.belongsToMany(Material, {
  through: MaterialStorage,
  foreignKey: "storageId",
});
Material.belongsToMany(Storage, {
  through: MaterialStorage,
  foreignKey: "materialId",
});

LogImport.hasMany(MaterialStorage, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
MaterialStorage.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

// HOOKS
MaterialStorage.addHook("afterCreate", async (ms, options) => {
  const masterId = `${ms.materialId}-${ms.storageId}`;
  await LogMaster.create({
    masterType: "MaterialStorage",
    masterId: masterId,
    action: "create",
    changes: JSON.stringify(ms),
    userId: options.userId,
  });
});

MaterialStorage.addHook("afterUpdate", async (ms, options) => {
  const masterId = `${ms.materialId}-${ms.storageId}`;

  // Ambil perubahan yang terjadi
  const changes = ms._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = ms.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "MaterialStorage",
      masterId: masterId,
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
      masterType: "MaterialStorage",
      masterId: masterId,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default MaterialStorage;
