import db from "../utils/Database.js";
import AdressRack from "./AddressRackModel.js";
import Category from "./CategoryModel.js";
import Location from "./LocationModel.js";
import Material from "./MaterialModel.js";
import Plant from "./PlantModel.js";
import Role from "./RoleModel.js";
import Shop from "./ShopModel.js";
import Supplier from "./SupplierModel.js";
import User from "./UserModel.js";
import GoodIssue from "./GoodIssueModel.js";
import Order from "./OrderModel.js";
import DetailOrder from "./DetailOrderModel.js";
import DetailGoodIssue from "./DetailGoodIssue.js";
import Inventory from "./InventoryModel.js";
import Retur from "./ReturModel.js";
import Incoming from "./IncomingModel.js";
import LogEntry from "./LogEntryModel.js";

(async () => {
  try {
    await db.sync({ force: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
})();
