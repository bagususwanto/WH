import AddressRack from "./AddressRackModel.js";
import Category from "./CategoryModel.js";
import LogMaster from "./LogMasterModel.js";
import Material from "./MaterialModel.js";
import Packaging from "./PackagingModel.js";
import Storage from "./StorageModel.js";
import Supplier from "./SupplierModel.js";
import User from "./UserModel.js";

const logMasterAssociations = () => {
  User.hasMany(LogMaster, { foreignKey: "userId", onDelete: "NO ACTION" });
  LogMaster.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

  // Material->LogMaster
  Material.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  Material.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  LogMaster.belongsTo(Material, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });

  // User->LogMaster
  User.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  User.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  LogMaster.belongsTo(User, {
    as: "userLog",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });

  // Category->LogMaster
  Category.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  Category.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  LogMaster.belongsTo(Category, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });

  // Supplier->LogMaster
  Supplier.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  Supplier.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  LogMaster.belongsTo(Supplier, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });

  // AddressRack->LogMaster
  AddressRack.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  AddressRack.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  LogMaster.belongsTo(AddressRack, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });

  // Packaging->LogMaster
  Packaging.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  Packaging.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  LogMaster.belongsTo(Packaging, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });

  // Storage->LogMaster
  Storage.hasMany(LogMaster, {
    as: "createdBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  Storage.hasMany(LogMaster, {
    as: "updatedBy",
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
  LogMaster.belongsTo(Storage, {
    foreignKey: "masterId",
    onDelete: "NO ACTION",
  });
};

export default logMasterAssociations;
