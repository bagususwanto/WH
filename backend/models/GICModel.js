import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import CostCenter from "./CostCenterModel.js";

const { DataTypes } = Sequelize;

const GIC = db.define(
  "GIC",
  {
    gicNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    costCenterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CostCenter,
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

CostCenter.hasMany(GIC, { foreignKey: "costCenterId" });
GIC.belongsTo(CostCenter, { foreignKey: "costCenterId" });

export default GIC;
