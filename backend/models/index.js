import db from "../utils/Database.js";

// master berdiri sendiri
import Category from "./CategoryModel.js";
import Supplier from "./SupplierModel.js";
import Packaging from "./PackagingModel.js";
import Role from "./RoleModel.js";
import Warehouse from "./WarehouseModel.js";
import Division from "./DivisionModel.js";
import Department from "./DepartmentModel.js";
import Line from "./LineModel.js";
import Group from "./GroupModel.js";
import WBS from "./WBSModel.js";
import CostCenter from "./CostCenterModel.js";
import Shift from "./ShiftModel.js";

// master ber-relasi
import Plant from "./PlantModel.js";
import GIC from "./GICModel.js";
import Section from "./SectionModel.js";
import Organization from "./OrganizationModel.js";
import User from "./UserModel.js";
import LogImport from "./LogImportModel.js";
import AdressRack from "./AddressRackModel.js";
import Storage from "./StorageModel.js";
import Material from "./MaterialModel.js";
import ServiceHours from "./ServiceHoursModel.js";
import UserWarehouse from "./UserWarehouseModel.js";
import MaterialStorage from "./MaterialStorageModel.js";
import AddressRack from "./AddressRackModel.js";
import DeliverySchedule from "./DeliveryScheduleModel.js";

// transaksi
import Inventory from "./InventoryModel.js";
import Incoming from "./IncomingModel.js";
import Approval from "./ApprovalModel.js";
import Notification from "./NotificationModel.js";
import Wishlist from "./WishlistModel.js";
import Order from "./OrderModel.js";
import DetailOrder from "./DetailOrderModel.js";
import Cart from "./CartModel.js";
import OrderHistory from "./OrderHistoryModel.js";
import Redpost from "./RedpostModel.js";
import DeliveryNote from "./DeliveryNoteModel.js";
import IncomingHistory from "./IncomingHistoryModel.js";
import VendorMovement from "./VendorMovementModel.js";
import DeliveryNoteVendorMovement from "./DeliveryNoteVendorMovementModel.js";

// log
import LogApproval from "./LogApprovalModel.js";
import LogEntry from "./LogEntryModel.js";
import LogMaster from "./LogMasterModel.js";

// Association
import { logMasterAssociations } from "./Association.js";

(async () => {
  try {
    logMasterAssociations();
    // await LogEntry.sync();
    // await db.sync({ force: true });
    // await LogEntry.sync({ force: true });
    // await LogEntry.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
})();
