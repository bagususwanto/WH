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

LogImport.hasMany(Supplier, { foreignKey: "logImportId", onDelete: "NO ACTION" });
Supplier.belongsTo(LogImport, { foreignKey: "logImportId", onDelete: "NO ACTION" });

export default Supplier;
