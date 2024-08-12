import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Location from "./LocationModel.js";

const { DataTypes } = Sequelize;

const AddressRack = db.define(
  "Address_Rack",
  {
    addressRackName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
  }
);

Location.hasMany(AddressRack, { foreignKey: "locationId" });
AddressRack.belongsTo(Location, { foreignKey: "locationId" });

export default AddressRack;
