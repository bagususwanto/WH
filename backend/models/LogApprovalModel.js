import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";
import DetailOrder from "./DetailOrderModel.js";

const { DataTypes } = Sequelize;

const LogApproval = db.define(
  "Log_Approval",
  {
    typeLog: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    detailOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DetailOrder,
        key: "id",
      },
    },
    quantityBefore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantityAfter: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(LogApproval, { foreignKey: "userId", onDelete: "NO ACTION" });
LogApproval.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

DetailOrder.hasMany(LogApproval, { foreignKey: "detailOrderId", onDelete: "CASCADE" });
LogApproval.belongsTo(DetailOrder, { foreignKey: "detailOrderId", onDelete: "CASCADE" });

export default LogApproval;
