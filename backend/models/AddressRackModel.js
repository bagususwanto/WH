import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Storage from "./StorageModel.js";
import LogImport from "./LogImportModel.js";

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

LogImport.hasMany(AddressRack, { foreignKey: "logImportId", onDelete: "NO ACTION" });
AddressRack.belongsTo(LogImport, { foreignKey: "logImportId", onDelete: "NO ACTION" });

export default AddressRack;
