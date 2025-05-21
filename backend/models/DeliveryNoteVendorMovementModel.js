import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import DeliveryNote from "./DeliveryNoteModel.js";
import VendorMovement from "./VendorMovementModel.js";

const { DataTypes } = Sequelize;

const DeliveryNoteVendorMovement = db.define(
  "Delivery_Note_Vendor_Movement",
  {
    deliveryNoteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DeliveryNote,
        key: "id",
      },
    },
    vendorMovementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: VendorMovement,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

DeliveryNote.belongsToMany(VendorMovement, {
  through: DeliveryNoteVendorMovement,
  foreignKey: "deliveryNoteId",
  onDelete: "NO ACTION",
});
VendorMovement.belongsToMany(DeliveryNote, {
  through: DeliveryNoteVendorMovement,
  foreignKey: "vendorMovementId",
  onDelete: "NO ACTION",
});

export default DeliveryNoteVendorMovement;
