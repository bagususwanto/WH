import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Inventory from "./InventoryModel.js";
import Material from "./MaterialModel.js";
import User from "./UserModel.js";
import DetailOrder from "./DetailOrderModel.js";
import Incoming from "./IncomingModel.js";

const { DataTypes } = Sequelize;

const LogEntry = db.define(
  "Log_Entry",
  {
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Inventory,
        key: "id",
      },
    },
    typeLogEntry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
      references: {
        model: Material,
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
    detailOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DetailOrder,
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
  },
  {
    freezeTableName: true,
  }
);

Inventory.hasMany(LogEntry, { foreignKey: "inventoryId", onDelete: "NO ACTION" });
LogEntry.belongsTo(Inventory, { foreignKey: "inventoryId", onDelete: "NO ACTION" });

User.hasMany(LogEntry, { foreignKey: "userId", onDelete: "NO ACTION" });
LogEntry.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

Material.hasMany(LogEntry, { foreignKey: "materialId", onDelete: "NO ACTION" });
LogEntry.belongsTo(Material, { foreignKey: "materialId", onDelete: "NO ACTION" });

DetailOrder.hasMany(LogEntry, { foreignKey: "detailOrderId", onDelete: "NO ACTION" });
LogEntry.belongsTo(DetailOrder, { foreignKey: "detailOrderId", onDelete: "NO ACTION" });

Incoming.hasMany(LogEntry, { foreignKey: "incomingId", onDelete: "NO ACTION" });
LogEntry.belongsTo(Incoming, { foreignKey: "incomingId", onDelete: "NO ACTION" });


export default LogEntry;
