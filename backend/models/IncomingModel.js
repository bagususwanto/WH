import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Material from "./MaterialModel.js";
import AddressRack from "./AddressRackModel.js";
import LogImport from "./LogImportModel.js";

const { DataTypes } = Sequelize;

const Incoming = db.define(
  "Incoming",
  {
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Material,
        key: "id",
      },
    },
    planning: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
      allowNull: false,
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

Material.hasMany(Incoming, { foreignKey: "materialId" });
Incoming.belongsTo(Material, { foreignKey: "materialId" });

AddressRack.hasMany(Incoming, { foreignKey: "addressId" });
Incoming.belongsTo(AddressRack, { foreignKey: "addressId" });

LogImport.hasMany(Incoming, { foreignKey: "logImportId" });
Incoming.belongsTo(LogImport, { foreignKey: "logImportId" });


export default Incoming;
