import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Warehouse from "./WarehouseModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Plant = db.define(
  "Plant",
  {
    plantCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
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

Warehouse.hasMany(Plant, { foreignKey: "warehouseId" });
Plant.belongsTo(Warehouse, { foreignKey: "warehouseId" });

// HOOKS
Plant.addHook("afterCreate", async (plant, options) => {
  await LogMaster.create({
    masterType: "Plant",
    masterId: plant.id,
    action: "create",
    changes: JSON.stringify(plant),
    userId: options.userId,
  });
});

Plant.addHook("afterUpdate", async (plant, options) => {
  // Ambil perubahan yang terjadi
  const changes = plant._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = plant.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Plant",
      masterId: plant.id,
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
      masterType: "Plant",
      masterId: plant.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Plant;
