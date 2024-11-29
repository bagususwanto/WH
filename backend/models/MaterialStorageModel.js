import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Storage from "./StorageModel.js";
import Material from "./MaterialModel.js";
import LogImport from "./LogImportModel.js";

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

export default MaterialStorage;
