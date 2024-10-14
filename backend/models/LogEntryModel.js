import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Inventory from "./InventoryModel.js";
import User from "./UserModel.js";
import Incoming from "./IncomingModel.js";
import DetailOrder from "./DetailOrderModel.js";

const { DataTypes } = Sequelize;

const LogEntry = db.define(
  "Log_Entry",
  {
    typeLogEntry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Inventory,
        key: "id",
      },
    },
    incomingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Incoming,
        key: "id",
      },
    },
    detailOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DetailOrder,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Inventory.hasMany(LogEntry, { foreignKey: "inventoryId", onDelete: "NO ACTION" });
LogEntry.belongsTo(Inventory, { foreignKey: "inventoryId", onDelete: "NO ACTION" });

User.hasMany(LogEntry, { foreignKey: "userId", onDelete: "NO ACTION" });
LogEntry.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

Incoming.hasMany(LogEntry, { foreignKey: "incomingId", onDelete: "NO ACTION" });
LogEntry.belongsTo(Incoming, { foreignKey: "incomingId", onDelete: "NO ACTION" });

DetailOrder.hasMany(LogEntry, { foreignKey: "detailOrderId", onDelete: "NO ACTION" });
LogEntry.belongsTo(DetailOrder, { foreignKey: "detailOrderId", onDelete: "NO ACTION" });

export default LogEntry;
