import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Material from "./MaterialModel.js";
import AddressRack from "./AddressRackModel.js";
import LogImport from "./LogImportModel.js";

const { DataTypes } = Sequelize;

const Inventory = db.define(
  "Inventory",
  {
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Material,
        key: "id",
      },
    },
    quantitySistem: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantityActual: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantityActualCheck: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    soh: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AddressRack,
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
  },
  {
    freezeTableName: true,
  }
);

Material.hasOne(Inventory, { foreignKey: "materialId" });
Inventory.belongsTo(Material, { foreignKey: "materialId" });

AddressRack.hasMany(Inventory, { foreignKey: "addressId" });
Inventory.belongsTo(AddressRack, { foreignKey: "addressId" });

LogImport.hasMany(Inventory, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
Inventory.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

export default Inventory;
