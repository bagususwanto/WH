import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Material from "./MaterialModel.js";

const { DataTypes } = Sequelize;

const Inventory = db.define(
  "Inventory",
  {
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
      allowNull: false,
      defaultValue:0,
    },
    quantityActual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
    },
  },
  {
    freezeTableName: true,
  }
);

Material.hasMany(Inventory, { foreignKey: "materialId" });
Inventory.belongsTo(Material, { foreignKey: "materialId" });

export default Inventory;
