import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Order from "./OrderModel.js";
import Material from "./MaterialModel.js";

const { DataTypes } = Sequelize;

const DetailOrder = db.define(
  "Detail_Order",
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
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
      allowNull: false,
      defaultValue:0,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

// Order.hasMany(DetailOrder, { foreignKey: "orderId" });
// DetailOrder.belongsTo(Order, { foreignKey: "orderId" });

// Material.hasMany(DetailOrder, { foreignKey: "materialId" });
// DetailOrder.belongsTo(Material, { foreignKey: "materialId" });

export default DetailOrder;
