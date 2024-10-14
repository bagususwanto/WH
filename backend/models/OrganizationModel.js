import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Group from "./GroupModel.js";
import Line from "./LineModel.js";
import Section from "./SectionModel.js";
import Department from "./DepartmentModel.js";
import Division from "./DivisionModel.js";
import Plant from "./PlantModel.js";

const { DataTypes } = Sequelize;

const Organization = db.define(
  "Organization",
  {
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Group,
        key: "id",
      },
    },
    lineId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Line,
        key: "id",
      },
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Section,
        key: "id",
      },
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Department,
        key: "id",
      },
    },
    divisionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Division,
        key: "id",
      },
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Plant,
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

Group.hasMany(Organization, {foreignKey: "groupId" });
Organization.belongsTo(Group, {foreignKey: "groupId" });

Line.hasMany(Organization, {foreignKey: "lineId" });
Organization.belongsTo(Line, {foreignKey: "lineId" });

Section.hasMany(Organization, {foreignKey: "sectionId" });
Organization.belongsTo(Section, {foreignKey: "sectionId" });

Department.hasMany(Organization, {foreignKey: "departmentId" });
Organization.belongsTo(Department, {foreignKey: "departmentId" });

Division.hasMany(Organization, {foreignKey: "divisionId" });
Organization.belongsTo(Division, {foreignKey: "divisionId" });

Plant.hasMany(Organization, {foreignKey: "plantId" });
Organization.belongsTo(Plant, {foreignKey: "plantId" });

export default Organization;
