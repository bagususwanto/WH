import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import Material from "./MaterialModel.js";
import AddressRack from "./AddressRackModel.js";

const { DataTypes } = Sequelize;

const Incoming = db.define(
  "Incoming",
  {
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Material,
        key: "id",
      },
    },
    planning: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
    },
    actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
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

Material.hasMany(Incoming, { foreignKey: "materialId" });
Incoming.belongsTo(Material, { foreignKey: "materialId" });

export default Incoming;
