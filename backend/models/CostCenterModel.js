import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Shop from "./ShopModel.js";

const { DataTypes } = Sequelize;

const CostCenter = db.define(
  "Cost_Center",
  {
    costCenterCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    costCenterName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wbsNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Shop,
        key: "id",
      },
    },
    ext: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

Shop.hasMany(CostCenter, { foreignKey: "shopId" });
CostCenter.belongsTo(Shop, { foreignKey: "shopId" });

export default CostCenter;
