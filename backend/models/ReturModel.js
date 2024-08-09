import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Material from "./MaterialModel.js";
import GoodIssue from "./GoodIssueModel.js";
import AddressRack from "./AddressRackModel.js";

const { DataTypes } = Sequelize;

const Retur = db.define(
  "Retur",
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
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    goodIssueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GoodIssue,
        key: "id",
      },
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AddressRack,
        key: "id",
      },
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Material.hasMany(Retur, { foreignKey: "materialId" });
Retur.belongsTo(Material, { foreignKey: "materialId" });

GoodIssue.hasMany(Retur, { foreignKey: "goodIssueId" });
Retur.belongsTo(GoodIssue, { foreignKey: "goodIssueId" });

AddressRack.hasMany(Retur, { foreignKey: "addressId" });
Retur.belongsTo(AddressRack, { foreignKey: "addressId" });

export default Retur;
