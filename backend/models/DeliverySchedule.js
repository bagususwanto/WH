import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";
import Supplier from "./SupplierModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const DeliverySchedule = db.define(
  "Delivery_Schedule",
  {
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Supplier,
        key: "id",
      },
    },
    schedule: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arrival: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    departure: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    truckStation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rit: {
      type: DataTypes.INTEGER,
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

LogImport.hasMany(DeliverySchedule, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
DeliverySchedule.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

Supplier.hasMany(DeliverySchedule, {
  foreignKey: "supplierId",
});
DeliverySchedule.belongsTo(Supplier, {
  foreignKey: "supplierId",
});

// HOOKS
DeliverySchedule.addHook("afterCreate", async (deliverySchedule, options) => {
  await LogMaster.create({
    masterType: "DeliverySchedule",
    masterId: deliverySchedule.id,
    action: "create",
    changes: JSON.stringify(deliverySchedule),
    userId: options.userId,
  });
});

DeliverySchedule.addHook("afterUpdate", async (deliverySchedule, options) => {
  // Ambil perubahan yang terjadi
  const changes = deliverySchedule._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = deliverySchedule.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "DeliverySchedule",
      masterId: deliverySchedule.id,
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
      masterType: "DeliverySchedule",
      masterId: deliverySchedule.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default DeliverySchedule;
