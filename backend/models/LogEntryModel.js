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
      allowNull: false,
      defaultValue: 0,
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
      defaultValue: 0,
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
      allowNull: false,
      defaultValue: 0,
      references: {
        model: DetailOrder,
        key: "id",
      },
    },
    incomingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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

// Inventory.hasMany(LogEntry, { foreignKey: "inventoryId" });
// LogEntry.belongsTo(Inventory, { foreignKey: "inventoryId" });

User.hasMany(LogEntry, { foreignKey: "userId" });
LogEntry.belongsTo(User, { foreignKey: "userId" });

// DetailOrder.hasMany(LogEntry, { foreignKey: "detailOrderId" });
// LogEntry.belongsTo(DetailOrder, { foreignKey: "detailOrderId" });

// Incoming.hasMany(LogEntry, { foreignKey: "incomingId" });
// LogEntry.belongsTo(Incoming, { foreignKey: "incomingId" });

Material.hasMany(LogEntry, { foreignKey: "materialId" });
LogEntry.belongsTo(Material, { foreignKey: "materialId" });

export default LogEntry;
