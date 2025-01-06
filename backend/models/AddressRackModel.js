import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Storage from "./StorageModel.js";
import LogImport from "./LogImportModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const AddressRack = db.define(
  "Address_Rack",
  {
    addressRackName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Storage,
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

Storage.hasMany(AddressRack, { foreignKey: "storageId" });
AddressRack.belongsTo(Storage, { foreignKey: "storageId" });

LogImport.hasMany(AddressRack, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
AddressRack.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

// HOOKS
AddressRack.addHook("afterCreate", async (address, options) => {
  await LogMaster.create({
    masterType: "AddressRack",
    masterId: address.id,
    action: "create",
    changes: JSON.stringify(address),
    userId: options.userId,
  });
});

AddressRack.addHook("afterUpdate", async (address, options) => {
  // Ambil perubahan yang terjadi
  const changes = address._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = address.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "AddressRack",
      masterId: address.id,
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
      masterType: "AddressRack",
      masterId: address.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});
export default AddressRack;
