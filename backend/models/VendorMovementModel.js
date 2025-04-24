import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Supplier from "./SupplierModel.js";
import Plant from "./PlantModel.js";

const { DataTypes } = Sequelize;

const VendorMovement = db.define(
  "Vendor_Movement",
  {
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Supplier,
        key: "id",
      },
    },
    movementDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    arrivalPlanTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    arrivalActualTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    departurePlanTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    departureActualTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    truckStation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Plant,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Supplier.hasMany(VendorMovement, {
  foreignKey: "supplierId",
});
VendorMovement.belongsTo(Supplier, {
  foreignKey: "supplierId",
});

Plant.hasMany(VendorMovement, {
  foreignKey: "plantId",
});
VendorMovement.belongsTo(Plant, {
  foreignKey: "plantId",
});

export default VendorMovement;
