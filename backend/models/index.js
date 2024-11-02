import db from "../utils/Database.js";

// master berdiri sendiri
import Category from "./CategoryModel.js";
import Supplier from "./SupplierModel.js";
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
import AddressRack from "./AddressRackModel.js";

// transaksi
import Inventory from "./InventoryModel.js";
import Incoming from "./IncomingModel.js";
import Approval from "./ApprovalModel.js";
import Notification from "./NotificationModel.js";
import Wishlist from "./WishlistModel.js";
import Order from "./OrderModel.js";
import DetailOrder from "./DetailOrderModel.js";
import Cart from "./CartModel.js";
import LogApproval from "./LogApprovalModel.js";
import LogEntry from "./LogEntryModel.js";
import OrderHistory from "./OrderHistoryModel.js";

(async () => {
  try {
    // await db.sync();
    // await db.sync({ force: true });
    // await LogEntry.sync({ force: true });
    // await AddressRack.sync({ alter: true });
    // console.log("Database synced successfully.");
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
})();
