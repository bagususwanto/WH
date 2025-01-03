import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Plant from "./PlantModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Storage = db.define(
  "Storage",
  {
    storageCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    storageName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Plant,
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

Plant.hasMany(Storage, { foreignKey: "plantId" });
Storage.belongsTo(Plant, { foreignKey: "plantId" });

// HOOKS
Storage.addHook("afterCreate", async (storage, options) => {
  await LogMaster.create({
    masterType: "Storage",
    masterId: storage.id,
    action: "create",
    changes: JSON.stringify(storage),
    userId: options.userId,
  });
});

Storage.addHook("afterUpdate", async (storage, options) => {
  // Ambil perubahan yang terjadi
  const changes = storage._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = storage.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Storage",
      masterId: storage.id,
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
      masterType: "Storage",
      masterId: storage.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Storage;
