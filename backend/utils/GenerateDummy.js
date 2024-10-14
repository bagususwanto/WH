import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Role from "../models/RoleModel.js";
import Warehouse from "../models/WarehouseModel.js";
import Division from "../models/DivisionModel.js";
import Department from "../models/DepartmentModel.js";
import Line from "../models/LineModel.js";
import Group from "../models/GroupModel.js";
import WBS from "../models/WBSModel.js";
import CostCenter from "../models/CostCenterModel.js";
import Shift from "../models/ShiftModel.js";
import GIC from "../models/GICModel.js";
import Section from "../models/SectionModel.js";
import Plant from "../models/PlantModel.js";
import Storage from "../models/StorageModel.js";
import Material from "../models/MaterialModel.js";
import Organization from "../models/OrganizationModel.js";
import AddressRack from "../models/AddressRackModel.js";
import ServiceHours from "../models/ServiceHoursModel.js";
import MaterialPlant from "../models/MaterialPlantModel.js";
import Inventory from "../models/InventoryModel.js";

import {
  categoryData,
  supplierData,
  roleData,
  warehouseData,
  divisionData,
  departmentData,
  lineData,
  groupData,
  WBSData,
  costCenterData,
  shiftData,
  GICData,
  sectionData,
  plantData,
  storageData,
} from "./DummyDB.js";

import { materialData, organizationData } from "./DummyDB2.js";
import { addressRackData, serviceHoursData } from "./DummyDB3.js";
import { materialPlantData } from "./DummyDB4.js";
import { inventoryData } from "./DummyDB5.js";

const generateCategories = async () => {
  try {
    // Insert data manual ke Category
    const result = await Category.bulkCreate(categoryData);
    console.log(`${result.length} entries created from category`);
  } catch (error) {
    console.error("Error inserting category:", error);
  }
};

const generateSuppliers = async () => {
  try {
    // Insert data manual ke Supplier
    const result = await Supplier.bulkCreate(supplierData);
    console.log(`${result.length} entries created from supplier`);
  } catch (error) {
    console.error("Error inserting supplier:", error);
  }
};

const generateRoles = async () => {
  try {
    // Insert data manual ke Role
    const result = await Role.bulkCreate(roleData);
    console.log(`${result.length} entries created from role`);
  } catch (error) {
    console.error("Error inserting role:", error);
  }
};

const generateWarehouse = async () => {
  try {
    // Insert data manual ke Warehouse
    const result = await Warehouse.bulkCreate(warehouseData);
    console.log(`${result.length} entries created from warehouse`);
  } catch (error) {
    console.error("Error inserting warehouse:", error);
  }
};

const generateDivisions = async () => {
  try {
    // Insert data manual ke Division
    const result = await Division.bulkCreate(divisionData);
    console.log(`${result.length} entries created from division`);
  } catch (error) {
    console.error("Error inserting division:", error);
  }
};

const generateDepartments = async () => {
  try {
    // Insert data manual ke Department
    const result = await Department.bulkCreate(departmentData);
    console.log(`${result.length} entries created from department`);
  } catch (error) {
    console.error("Error inserting department:", error);
  }
};

const generateLines = async () => {
  try {
    // Insert data manual ke Line
    const result = await Line.bulkCreate(lineData);
    console.log(`${result.length} entries created from line`);
  } catch (error) {
    console.error("Error inserting line:", error);
  }
};

const generateGroups = async () => {
  try {
    // Insert data manual ke Group
    const result = await Group.bulkCreate(groupData);
    console.log(`${result.length} entries created from group`);
  } catch (error) {
    console.error("Error inserting group:", error);
  }
};

const generateWBS = async () => {
  try {
    // Insert data manual ke WBS
    const result = await WBS.bulkCreate(WBSData);
    console.log(`${result.length} entries created from WBS`);
  } catch (error) {
    console.error("Error inserting WBS:", error);
  }
};

const generateCostCenter = async () => {
  try {
    // Insert data manual ke CostCenter
    const result = await CostCenter.bulkCreate(costCenterData);
    console.log(`${result.length} entries created from CostCenter`);
  } catch (error) {
    console.error("Error inserting CostCenter:", error);
  }
};

const generateShift = async () => {
  try {
    // Insert data manual ke Shift
    const result = await Shift.bulkCreate(shiftData);
    console.log(`${result.length} entries created from Shift`);
  } catch (error) {
    console.error("Error inserting Shift:", error);
  }
};

const generateGIC = async () => {
  try {
    // Insert data manual ke GIC
    const result = await GIC.bulkCreate(GICData);
    console.log(`${result.length} entries created from GIC`);
  } catch (error) {
    console.error("Error inserting GIC:", error);
  }
};

const generateSection = async () => {
  try {
    // Insert data manual ke Section
    const result = await Section.bulkCreate(sectionData);
    console.log(`${result.length} entries created from Section`);
  } catch (error) {
    console.error("Error inserting Section:", error);
  }
};

const generatePlant = async () => {
  try {
    // Insert data manual ke Plant
    const result = await Plant.bulkCreate(plantData);
    console.log(`${result.length} entries created from Plant`);
  } catch (error) {
    console.error("Error inserting Plant:", error);
  }
};

const generateStorage = async () => {
  try {
    // Insert data manual ke Storage
    const result = await Storage.bulkCreate(storageData);
    console.log(`${result.length} entries created from Storage`);
  } catch (error) {
    console.error("Error inserting Storage:", error);
  }
};

const generateMaterial = async () => {
  try {
    // Insert data manual ke Material
    const result = await Material.bulkCreate(materialData);
    console.log(`${result.length} entries created from Material`);
  } catch (error) {
    console.error("Error inserting Material:", error);
  }
};

const generateOrganization = async () => {
  try {
    // Insert data manual ke Organization
    const result = await Organization.bulkCreate(organizationData);
    console.log(`${result.length} entries created from Organization`);
  } catch (error) {
    console.error("Error inserting Organization:", error);
  }
};

const generateAddressRack = async () => {
  try {
    // Insert data manual ke AddressRack
    const result = await AddressRack.bulkCreate(addressRackData);
    console.log(`${result.length} entries created from AddressRack`);
  } catch (error) {
    console.error("Error inserting AddressRack:", error);
  }
};

const generateServiceHours = async () => {
  try {
    // Insert data manual ke ServiceHours
    const result = await ServiceHours.bulkCreate(serviceHoursData);
    console.log(`${result.length} entries created from ServiceHours`);
  } catch (error) {
    console.error("Error inserting ServiceHours:", error);
  }
};

const generateMaterialPlant = async () => {
  try {
    // Insert data manual ke MaterialPlant
    const result = await MaterialPlant.bulkCreate(materialPlantData);
    console.log(`${result.length} entries created from MaterialPlant`);
  } catch (error) {
    console.error("Error inserting MaterialPlant:", error);
  }
};

const generateInventory = async () => {
  try {
    // Insert data manual ke Inventory
    const result = await Inventory.bulkCreate(inventoryData);
    console.log(`${result.length} entries created from Inventory`);
  } catch (error) {
    console.error("Error inserting Inventory:", error);
  }
};

const generateDummyData = async () => {
  await generateCategories();
  await generateSuppliers();
  await generateRoles();
  await generateWarehouse();
  await generateDivisions();
  await generateDepartments();
  await generateLines();
  await generateGroups();
  await generateWBS();
  await generateCostCenter();
  await generateShift();

  await generateGIC();
  await generateSection();
  await generatePlant();
  await generateStorage();
  await generateMaterial();
  await generateOrganization();
  await generateAddressRack();
  await generateServiceHours();

  await generateMaterialPlant();

  await generateInventory();
};

generateDummyData()
  .then(() => {
    console.log("All dummy data generated.");
  })
  .catch((err) => {
    console.error(err);
  });
