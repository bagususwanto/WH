import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import LogImport from "./LogImportModel.js";

const { DataTypes } = Sequelize;

const Packaging = db.define(
  "Packaging",
  {
    packaging: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unitPackaging: {
      type: DataTypes.DECIMAL,
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

LogImport.hasMany(Packaging, { foreignKey: "logImportId" });
Packaging.belongsTo(LogImport, { foreignKey: "logImportId" });

export default Packaging;
