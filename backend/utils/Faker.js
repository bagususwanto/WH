import { faker } from "@faker-js/faker";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Role from "../models/RoleModel.js";
import Warehouse from "../models/WarehouseModel.js";
import Division from "../models/DivisionModel.js";
import WBS from "../models/WBSModel.js";
import CostCenter from "../models/CostCenterModel.js";
import Shift from "../models/ShiftModel.js";
import GIC from "../models/GICModel.js";
import Plant from "../models/PlantModel.js";
import Department from "../models/DepartmentModel.js";
import Section from "../models/SectionModel.js";
import Line from "../models/LineModel.js";
import Group from "../models/GroupModel.js";
import Storage from "../models/StorageModel.js";
import Material from "../models/MaterialModel.js";
import User from "../models/UserModel.js";
import AddressRack from "../models/AddressRackModel.js";
import UserWarehouse from "../models/UserWarehouseModel.js";
import ServiceHours from "../models/ServiceHoursModel.js";
import MaterialPlant from "../models/MaterialPlantModel.js";
import Inventory from "../models/InventoryModel.js";
import Order from "../models/OrderModel.js";
import DetailOrder from "../models/DetailOrderModel.js";
import Organization from "../models/OrganizationModel.js";

// Generate dummy data for Category
const generateCategories = async (num) => {
  const categories = [];
  for (let i = 0; i < num; i++) {
    categories.push({
      categoryName: faker.commerce.department(),
    });
  }
  await Category.bulkCreate(categories);
  console.log(`${num} categories inserted.`);
};

// Generate dummy data for Supplier
const generateSuppliers = async (num) => {
  const suppliers = [];
  for (let i = 0; i < num; i++) {
    suppliers.push({
      supplierName: faker.company.name(),
    });
  }
  await Supplier.bulkCreate(suppliers);
  console.log(`${num} suppliers inserted.`);
};

// Generate dummy data for Role
const generateRoles = async (num) => {
  const roles = [];
  for (let i = 0; i < num; i++) {
    roles.push({
      roleName: faker.person.jobTitle(),
    });
  }
  await Role.bulkCreate(roles);
  console.log(`${num} roles inserted.`);
};

// Generate dummy data for Warehouse
const generateWarehouses = async (num) => {
  const warehouses = [];
  for (let i = 0; i < num; i++) {
    warehouses.push({
      warehouseCode: faker.number.int({ min: 1000, max: 9999 }),
      warehouseName: faker.company.name(),
    });
  }
  await Warehouse.bulkCreate(warehouses);
  console.log(`${num} warehouses inserted.`);
};

// Generate dummy data for Division
const generateDivisions = async (num) => {
  const divisions = [];
  for (let i = 0; i < num; i++) {
    divisions.push({
      divisionName: faker.commerce.department(),
    });
  }
  await Division.bulkCreate(divisions);
  console.log(`${num} divisions inserted.`);
};

// Fungsi untuk generate Department
const generateDepartments = async (num) => {
  const departments = [];
  for (let i = 0; i < num; i++) {
    departments.push({
      departmentName: faker.commerce.department(),
    });
  }
  await Department.bulkCreate(departments);
  console.log(`${num} departments inserted.`);
};

// Fungsi untuk generate Section
const generateSections = async (num) => {
  const gics = await GIC.findAll({ attributes: ["id"] });
  const wbs = await WBS.findAll({ attributes: ["id"] });

  const sections = [];
  for (let i = 0; i < num; i++) {
    const gicId = faker.helpers.arrayElement(gics).id;
    const wbsId = faker.helpers.arrayElement(wbs).id;

    sections.push({
      sectionCode: faker.number.int({ min: 1000, max: 9999 }),
      sectionName: faker.commerce.productName(),
      gicId,
      wbsId,
    });
  }
  await Section.bulkCreate(sections);
  console.log(`${num} sections inserted.`);
};

// Fungsi untuk generate Line
const generateLines = async (num) => {
  const lines = [];
  for (let i = 0; i < num; i++) {
    lines.push({
      lineName: faker.commerce.productName(),
    });
  }
  await Line.bulkCreate(lines);
  console.log(`${num} lines inserted.`);
};

// Fungsi untuk generate Group
const generateGroups = async (num) => {
  const groups = [];
  for (let i = 0; i < num; i++) {
    groups.push({
      groupName: faker.commerce.productName(),
    });
  }
  await Group.bulkCreate(groups);
  console.log(`${num} groups inserted.`);
};

// Generate dummy data for WBS
const generateWBS = async (num) => {
  const wbs = [];
  for (let i = 0; i < num; i++) {
    wbs.push({
      wbsNumber: faker.finance.accountNumber(),
      wbsYear: faker.number.int({ min: 2000, max: new Date().getFullYear() }),
    });
  }
  await WBS.bulkCreate(wbs);
  console.log(`${num} WBS inserted.`);
};

// Generate dummy data for Cost Center
const generateCostCenters = async (num) => {
  const costCenters = [];
  for (let i = 0; i < num; i++) {
    costCenters.push({
      costCenter: faker.finance.accountNumber(),
      costCenterName: faker.company.name(),
    });
  }
  await CostCenter.bulkCreate(costCenters);
  console.log(`${num} cost centers inserted.`);
};

// Generate dummy data for Shift
const generateShifts = async (num) => {
  const shifts = [];
  for (let i = 0; i < num; i++) {
    shifts.push({
      shiftCode: faker.number.int({ min: 1, max: 2 }), // Random shift code between 1 and 2
      shiftName: faker.person.jobType(), // Random shift name
    });
  }
  await Shift.bulkCreate(shifts);
  console.log(`${num} shifts inserted.`);
};

// Generate dummy data for GIC
const generateGICs = async (num) => {
  const costCenterIds = await CostCenter.findAll({ attributes: ["id"] });

  const gics = [];
  for (let i = 0; i < num; i++) {
    const costCenterId = faker.helpers.arrayElement(costCenterIds).id;

    gics.push({
      gicNumber: faker.number.int({ min: 1, max: 100 }), // Generate random GIC number between 1 and 100
      costCenterId,
    });
  }
  await GIC.bulkCreate(gics);
  console.log(`${num} GICs inserted.`);
};

// Fungsi untuk generate Plant
const generatePlants = async (num) => {
  const warehouses = await Warehouse.findAll({ attributes: ["id"] });

  const plants = [];
  for (let i = 0; i < num; i++) {
    const warehouseId = faker.helpers.arrayElement(warehouses).id;

    plants.push({
      plantCode: faker.number.int({ min: 1000, max: 9999 }),
      plantName: faker.company.name(),
      warehouseId,
    });
  }
  await Plant.bulkCreate(plants);
  console.log(`${num} plants inserted.`);
};

// Fungsi untuk generate Storage
const generateStorages = async (num) => {
  const plants = await Plant.findAll({ attributes: ["id"] });

  const storages = [];
  for (let i = 0; i < num; i++) {
    const plantId = faker.helpers.arrayElement(plants).id;

    storages.push({
      storageCode: faker.number.int({ min: 1000, max: 9999 }),
      storageName: faker.company.name(),
      plantId,
    });
  }
  await Storage.bulkCreate(storages);
  console.log(`${num} storages inserted.`);
};

// Fungsi untuk generate Material
const generateMaterials = async (num) => {
  const suppliers = await Supplier.findAll({ attributes: ["id"] });
  const categories = await Category.findAll({ attributes: ["id"] });

  const materials = [];
  for (let i = 0; i < num; i++) {
    const supplierId = faker.helpers.arrayElement(suppliers).id;
    const categoryId = faker.helpers.arrayElement(categories).id;

    materials.push({
      materialNo: faker.commerce.isbn(),
      description: faker.commerce.productMaterial(),
      uom: faker.helpers.arrayElement(["KG", "L", "PCS"]),
      price: faker.commerce.price(),
      type: faker.helpers.arrayElement(["DIRECT", "INDIRECT"]),
      mrpType: faker.helpers.arrayElement(["NQC", "ROP"]),
      minStock: faker.number.int({ min: 1, max: 1000 }),
      maxStock: faker.number.int({ min: 100, max: 5000 }),
      img: faker.image.url(),
      minOrder: faker.number.int({ min: 10, max: 100 }),
      categoryId,
      supplierId,
    });
  }
  await Material.bulkCreate(materials);
  console.log(`${num} materials inserted.`);
};

// Fungsi untuk generate User
const generateUsers = async (num) => {
  const roles = await Role.findAll({ attributes: ["id"] });
  const warehouses = await Warehouse.findAll({ attributes: ["id"] });
  const divisions = await Division.findAll({ attributes: ["id"] });
  const departments = await Department.findAll({ attributes: ["id"] });
  const sections = await Section.findAll({ attributes: ["id"] });
  const lines = await Line.findAll({ attributes: ["id"] });
  const groups = await Group.findAll({ attributes: ["id"] });
  const organizations = await Organization.findAll({ attributes: ["id"] });

  const users = [];
  for (let i = 0; i < num; i++) {
    const roleId = faker.helpers.arrayElement(roles).id;
    const warehouseId = faker.helpers.arrayElement(warehouses).id;
    const divisionId = faker.helpers.arrayElement(divisions).id;
    const departmentId = faker.helpers.arrayElement(departments).id;
    const sectionId = faker.helpers.arrayElement(sections).id;
    const lineId = faker.helpers.arrayElement(lines).id;
    const groupId = faker.helpers.arrayElement(groups).id;
    const organizationId = faker.helpers.arrayElement(organizations).id;

    users.push({
      username: faker.internet.userName(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      roleId,
      groupId,
      lineId,
      sectionId,
      departmentId,
      divisionId,
      isProduction: faker.helpers.arrayElement([1, 0]),
      warehouseId,
      organizationId,
    });
  }
  await User.bulkCreate(users);
  console.log(`${num} users inserted.`);
};

const generateAddressRacks = async (num) => {
  const addressRacks = [];
  const storageIds = await Storage.findAll({ attributes: ["id"] });

  for (let i = 0; i < num; i++) {
    const storageId = faker.helpers.arrayElement(storageIds).id;

    addressRacks.push({
      addressRackName: faker.commerce.department(), // Generates a random name for address rack
      storageId: storageId, // Randomly selects a storageId from existing storages
    });
  }

  await AddressRack.bulkCreate(addressRacks);
  console.log(`${num} address racks inserted.`);
};

async function generateServiceHours(num) {
  try {
    // Ambil semua shiftId dan warehouseId yang ada
    const shifts = await Shift.findAll({ attributes: ["id"] });
    const warehouses = await Warehouse.findAll({ attributes: ["id"] });

    if (shifts.length === 0 || warehouses.length === 0) {
      throw new Error("No shifts or warehouses found in the database.");
    }

    // Array untuk menyimpan data yang akan dimasukkan
    const ServiceHoursData = [];

    // Loop untuk membuat beberapa data faker
    for (let i = 0; i < num; i++) {
      const randomShift = faker.helpers.arrayElement(shifts);
      const randomWarehouse = faker.helpers.arrayElement(warehouses);

      ServiceHoursData.push({
        shiftId: randomShift.id,
        warehouseId: randomWarehouse.id,
        time: faker.helpers.arrayElement(["08:00", "12:00", "16:00", "20:00"]),
      });
    }

    // Masukkan semua data sekaligus ke dalam tabel
    const createdEntries = await ServiceHours.bulkCreate(ServiceHoursData);

    console.log(`${createdEntries.length} Faker entries created successfully`);
  } catch (error) {
    console.error("Error generating faker data:", error);
  }
}

const generateOrganization = async (num) => {
  const plants = await Plant.findAll({ attributes: ["id"] });
  const divisions = await Division.findAll({ attributes: ["id"] });
  const departments = await Department.findAll({ attributes: ["id"] });
  const sections = await Section.findAll({ attributes: ["id"] });
  const lines = await Line.findAll({ attributes: ["id"] });
  const groups = await Group.findAll({ attributes: ["id"] });

  const organizations = [];
  for (let i = 0; i < num; i++) {
    const plantId = faker.helpers.arrayElement(plants).id;
    const divisionId = faker.helpers.arrayElement(divisions).id;
    const departmentId = faker.helpers.arrayElement(departments).id;
    const sectionId = faker.helpers.arrayElement(sections).id;
    const lineId = faker.helpers.arrayElement(lines).id;
    const groupId = faker.helpers.arrayElement(groups).id;

    organizations.push({
      groupId,
      lineId,
      sectionId,
      departmentId,
      divisionId,
      plantId,
    });
  }
  await Organization.bulkCreate(organizations);
  console.log(`${num} organizations inserted.`);
};

async function generateUserWarehouse(num) {
  try {
    // Ambil semua userId dan warehouseId yang ada
    const users = await User.findAll({ attributes: ["id"] });
    const warehouses = await Warehouse.findAll({ attributes: ["id"] });

    if (users.length === 0 || warehouses.length === 0) {
      throw new Error("No users or warehouses found in the database.");
    }

    // Array untuk menyimpan data yang akan dimasukkan
    const UserWarehouseData = [];

    // Loop untuk membuat beberapa data faker
    for (let i = 0; i < num; i++) {
      const randomUser = faker.helpers.arrayElement(users);
      const randomWarehouse = faker.helpers.arrayElement(warehouses);

      UserWarehouseData.push({
        userId: randomUser.id,
        warehouseId: randomWarehouse.id,
      });
    }

    // Masukkan semua data sekaligus ke dalam tabel
    const createdEntries = await UserWarehouse.bulkCreate(UserWarehouseData);

    console.log(`${createdEntries.length} Faker entries created successfully`);
  } catch (error) {
    console.error("Error generating faker data:", error);
  }
}

async function generateMaterialPlant(num) {
  try {
    // Ambil semua materialId dan warehouseId yang ada
    const materials = await Material.findAll({ attributes: ["id"] });
    const plants = await Plant.findAll({ attributes: ["id"] });

    if (materials.length === 0 || plants.length === 0) {
      throw new Error("No materials or plants found in the database.");
    }

    // Array untuk menyimpan data yang akan dimasukkan
    const MaterialPlantData = [];

    // Loop untuk membuat beberapa data faker
    for (let i = 0; i < num; i++) {
      const randomMaterial = faker.helpers.arrayElement(materials);
      const randomPlant = faker.helpers.arrayElement(plants);

      MaterialPlantData.push({
        materialId: randomMaterial.id,
        warehouseId: randomPlant.id,
      });
    }

    // Masukkan semua data sekaligus ke dalam tabel
    const createdEntries = await MaterialPlant.bulkCreate(MaterialPlantData);

    console.log(`${createdEntries.length} Faker entries created successfully`);
  } catch (error) {
    console.error("Error generating faker data:", error);
  }
}

const generateInventory = async (num) => {
  const inventories = [];
  const materialIds = await Material.findAll({ attributes: ["id"] });
  const addressIds = await AddressRack.findAll({ attributes: ["id"] });

  for (let i = 0; i < num; i++) {
    const materialId = faker.helpers.arrayElement(materialIds).id;
    const addressId = faker.helpers.arrayElement(addressIds).id;

    inventories.push({
      materialId,
      quantitySistem: faker.number.int({ min: 0, max: 1000 }),
      quantityActual: faker.number.int({ min: 0, max: 1000 }),
      quantityActualCheck: faker.number.int({ min: 0, max: 1000 }),
      remarks: faker.lorem.sentence(),
      addressId,
    });
  }

  await Inventory.bulkCreate(inventories);
  console.log(`${num} inventories inserted.`);
};

const generateOrders = async (num) => {
  try {
    const orders = [];
    const detailOrders = [];

    const inventories = await Inventory.findAll({ attributes: ["id"] });
    const Users = await User.findAll({ attributes: ["id"] });
    const roles = await Role.findAll({ attributes: ["id"] });

    for (let i = 0; i < num; i++) {
      const scheduleDeliveryDate = faker.date.future(); // Generate future date

      // Generate order data
      const userId = faker.helpers.arrayElement(Users).id;
      const requestNumber = faker.number.int({ min: 10000000, max: 99999999 });
      const transactionNumber = faker.finance.accountNumber();
      const totalPrice = parseFloat(faker.commerce.price());
      const paymentMethod = faker.helpers.arrayElement(["WBS", "GIC"]);
      const paymentNumber = faker.finance.accountNumber();
      const status = faker.helpers.arrayElement(["Pending", "Completed", "Cancelled"]);
      const scheduleDelivery = `${scheduleDeliveryDate.getHours()}:${scheduleDeliveryDate.getMinutes()}`; // Format TIME
      const deliveryMethod = faker.helpers.arrayElement(["Courier", "Pickup"]);
      const deliveredAt = Math.random() > 0.5 ? faker.date.past() : null; // Randomly assign deliveredAt
      const remarks = faker.lorem.sentence();
      const currentRoleApprovalId = faker.helpers.arrayElement(roles).id;
      const isLastApproval = faker.number.int({ min: 0, max: 1 });
      const isApproval = faker.number.int({ min: 0, max: 1 });
      const isMoreThanCertainPrice = totalPrice > 20000000 ? 1 : 0;

      const order = {
        userId,
        requestNumber,
        transactionNumber,
        totalPrice,
        paymentMethod,
        paymentNumber,
        status,
        scheduleDelivery,
        deliveryMethod,
        deliveredAt: deliveredAt ? deliveredAt.toISOString() : null,
        remarks,
        currentRoleApprovalId,
        isLastApproval,
        isApproval,
        isMoreThanCertainPrice,
      };

      orders.push(order);

      // Generate detail order data
      const inventoryId = faker.helpers.arrayElement(inventories).id;
      const quantity = faker.number.int({ min: 1, max: 10 });
      const price = totalPrice / quantity; // Example price calculation
      const condition = faker.helpers.arrayElement(["OK", "NG"]);
      const isReject = faker.number.int({ min: 0, max: 1 });
      const detailOrder = {
        inventoryId,
        quantity,
        price,
        condition,
        remarks,
        isReject,
        isMoreThanCertainPrice,
      };

      detailOrders.push(detailOrder);
    }

    // Save orders to database
    const createdOrders = await Order.bulkCreate(orders);
    const createdDetailOrders = detailOrders.map((detailOrder, index) => ({
      ...detailOrder,
      orderId: createdOrders[index].id, // Link detail order to the created order
    }));

    // Save detail orders to database
    await DetailOrder.bulkCreate(createdDetailOrders);

    console.log(`${num} Orders and detail orders created successfully.`);
  } catch (error) {
    console.error("Error creating orders:", error);
  }
};

// Main function to call all generators
const generateDummyData = async () => {
  await generateCategories(10);
  await generateSuppliers(20);
  await generateRoles(5);
  await generateWarehouses(5);
  await generateDivisions(10);
  await generateDepartments(10);
  await generateLines(50);
  await generateGroups(50);
  await generateWBS(20);
  await generateCostCenters(30);
  await generateShifts(2);

  await generateGICs(10);
  await generateSections(20);
  await generatePlants(5);
  await generateStorages(30);
  await generateMaterials(1000);
  await generateOrganization(100);
  await generateUsers(10);
  await generateAddressRacks(1000);
  await generateServiceHours(10);

  await generateUserWarehouse(10);
  await generateMaterialPlant(1000);

  await generateInventory(1000);
  await generateOrders(100);
};

generateDummyData()
  .then(() => {
    console.log("All dummy data generated.");
  })
  .catch((err) => {
    console.error(err);
  });
