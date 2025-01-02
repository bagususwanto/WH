import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Warehouse from "./WarehouseModel.js";
import Shift from "./ShiftModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const ServiceHours = db.define(
  "Service_Hours",
  {
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
        key: "id",
      },
    },
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Shift,
        key: "id",
      },
    },
    time: {
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

Warehouse.hasMany(ServiceHours, { foreignKey: "warehouseId" });
ServiceHours.belongsTo(Warehouse, { foreignKey: "warehouseId" });

Shift.hasMany(ServiceHours, { foreignKey: "shiftId" });
ServiceHours.belongsTo(Shift, { foreignKey: "shiftId" });

// HOOKS
ServiceHours.addHook("afterCreate", async (servHours, options) => {
  await LogMaster.create({
    masterType: "ServiceHours",
    masterId: servHours.id,
    action: "create",
    changes: JSON.stringify(servHours),
    userId: options.userId,
  });
});

ServiceHours.addHook("afterUpdate", async (servHours, options) => {
  // Ambil perubahan yang terjadi
  const changes = servHours._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = servHours.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "ServiceHours",
      masterId: servHours.id,
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
      masterType: "ServiceHours",
      masterId: servHours.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default ServiceHours;
