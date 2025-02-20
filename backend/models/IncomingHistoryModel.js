import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Incoming from "./IncomingModel.js";

const { DataTypes } = Sequelize;

const IncomingHistory = db.define(
  "Incoming_History",
  {
    incomingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Incoming,
        key: "id",
      },
    },
    planning: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    actual: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    incomingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Incoming.hasMany(IncomingHistory, { foreignKey: "incomingId" });
IncomingHistory.belongsTo(Incoming, { foreignKey: "incomingId" });

export default IncomingHistory;
