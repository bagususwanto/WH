import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Plant from "./PlantModel.js";
import Material from "./MaterialModel.js";

const { DataTypes } = Sequelize;

const MaterialPlant = db.define(
  "Material_Plant",
  {
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Plant,
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

Plant.belongsToMany(Material, { through: MaterialPlant, foreignKey: "plantId" });
Material.belongsToMany(Plant, { through: MaterialPlant, foreignKey: "materialId" });

export default MaterialPlant;
