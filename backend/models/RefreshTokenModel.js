import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const RefreshToken = db.define(
  "Refresh_Token",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(RefreshToken, {
  foreignKey: "userId",
});
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
});

export default RefreshToken;
