import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import DetailOrder from "./DetailOrderModel.js";

const { DataTypes } = Sequelize;

const Redpost = db.define(
  "Redpost",
  {
    detailOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DetailOrder,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    quantityRequest: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantityReturn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    freezeTableName: true,
  }
);

DetailOrder.hasMany(Redpost, { foreignKey: "detailOrderId", onDelete: "NO ACTION" });
Redpost.belongsTo(DetailOrder, { foreignKey: "detailOrderId", onDelete: "NO ACTION" });

User.hasMany(Redpost, { foreignKey: "userId", onDelete: "NO ACTION" });
Redpost.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

export default Redpost;
