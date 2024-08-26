import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Supplier from "./SupplierModel.js";
import Category from "./CategoryModel.js";

const { DataTypes } = Sequelize;

const Material = db.define(
  "Material",
  {
    materialNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Supplier,
        key: "id",
      },
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:1,
    },
  },
  {
    freezeTableName: true,
  }
);


Category.hasMany(Material, { foreignKey: "categoryId" });
Material.belongsTo(Category, { foreignKey: "categoryId" });

Supplier.hasMany(Material, { foreignKey: "supplierId" });
Material.belongsTo(Supplier, { foreignKey: "supplierId" });

export default Material;
