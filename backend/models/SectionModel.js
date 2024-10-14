import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import WBS from "./WBSModel.js";
import GIC from "./GICModel.js";

const { DataTypes } = Sequelize;

const Section = db.define(
  "Section",
  {
    sectionCode: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    sectionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GIC,
        key: "id",
      },
    },
    wbsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WBS,
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


GIC.hasMany(Section, { foreignKey: "gicId" });
Section.belongsTo(GIC, { foreignKey: "gicId" });

WBS.hasMany(Section, { foreignKey: "wbsId" });
Section.belongsTo(WBS, { foreignKey: "wbsId" });

export default Section;
