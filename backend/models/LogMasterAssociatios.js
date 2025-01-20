import AddressRack from "./AddressRackModel.js";
import Category from "./CategoryModel.js";
import CostCenter from "./CostCenterModel.js";
import DeliverySchedule from "./DeliveryScheduleModel.js";
import Department from "./DepartmentModel.js";
import Division from "./DivisionModel.js";
import GIC from "./GICModel.js";
import Group from "./GroupModel.js";
import Line from "./LineModel.js";
import LogMaster from "./LogMasterModel.js";
import Material from "./MaterialModel.js";
import MaterialStorage from "./MaterialStorageModel.js";
import Organization from "./OrganizationModel.js";
import Packaging from "./PackagingModel.js";
import Plant from "./PlantModel.js";
import Role from "./RoleModel.js";
import Section from "./SectionModel.js";
import ServiceHours from "./ServiceHoursModel.js";
import Shift from "./ShiftModel.js";
import Storage from "./StorageModel.js";
import Supplier from "./SupplierModel.js";
import User from "./UserModel.js";
import UserWarehouse from "./UserWarehouseModel.js";
import Warehouse from "./WarehouseModel.js";
import WBS from "./WBSModel.js";

export default function logMasterAssociations() {
  User.hasMany(LogMaster, { foreignKey: "userId", onDelete: "NO ACTION" });
  LogMaster.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

  // Material->LogMaster
  Material.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Material.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Material, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // User->LogMaster
  User.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  User.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(User, {
    as: "userLog",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Category->LogMaster
  Category.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Category.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Category, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Supplier->LogMaster
  Supplier.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Supplier.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Supplier, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // AddressRack->LogMaster
  AddressRack.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  AddressRack.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(AddressRack, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Packaging->LogMaster
  Packaging.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Packaging.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Packaging, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Storage->LogMaster
  Storage.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Storage.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Storage, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Department->LogMaster
  Department.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Department.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Department, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Shift->LogMaster
  Shift.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Shift.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Shift, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Division->LogMaster
  Division.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Division.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Division, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // ServiceHours->LogMaster
  ServiceHours.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  ServiceHours.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(ServiceHours, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Warehouse->LogMaster
  Warehouse.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Warehouse.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Warehouse, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Plant->LogMaster
  Plant.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Plant.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Plant, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // CostCenter->LogMaster
  CostCenter.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  CostCenter.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(CostCenter, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // GIC->LogMaster
  GIC.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  GIC.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(GIC, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // WBS->LogMaster
  WBS.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  WBS.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(WBS, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Organization->LogMaster
  Organization.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Organization.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Organization, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Section->LogMaster
  Section.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Section.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Section, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Line->LogMaster
  Line.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Line.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Line, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Group->LogMaster
  Group.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Group.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Group, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // Role->LogMaster
  Role.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  Role.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(Role, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // UserWarehouse->LogMaster
  UserWarehouse.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  UserWarehouse.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(UserWarehouse, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // MaterialStorage->LogMaster
  MaterialStorage.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  MaterialStorage.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(MaterialStorage, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });

  // DeliverySchedule->LogMaster
  DeliverySchedule.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  DeliverySchedule.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
  LogMaster.belongsTo(DeliverySchedule, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
    constraints: false,
  });
}
