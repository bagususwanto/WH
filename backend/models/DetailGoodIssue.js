import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import GoodIssue from "./GoodIssueModel.js";
import Material from "./MaterialModel.js";

const { DataTypes } = Sequelize;

const DetailGoodIssue = db.define(
  "Detail_Good_Issue",
  {
    goodIssueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GoodIssue,
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull:true
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

GoodIssue.hasMany(DetailGoodIssue, { foreignKey: "goodIssueId" });
DetailGoodIssue.belongsTo(GoodIssue, { foreignKey: "goodIssueId" });

Material.hasMany(DetailGoodIssue, { foreignKey: "materialId" });
DetailGoodIssue.belongsTo(Material, { foreignKey: "materialId" });

export default DetailGoodIssue;
