import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";

const { DataTypes } = Sequelize;

const Supplier = db.define(
  "Supplier",
  {
    supplierName: {
      type: DataTypes.STRING,
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

Supplier.hasMany(LogImport, { foreignKey: "logImportId" });
LogImport.belongsTo(Supplier, { foreignKey: "logImportId" });

export default Supplier;
