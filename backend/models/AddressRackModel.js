import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Storage from "./StorageModel.js";

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

export default AddressRack;
