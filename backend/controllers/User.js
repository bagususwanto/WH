import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import Role from "../models/RoleModel.js";
import Plant from "../models/PlantModel.js";
import Group from "../models/GroupModel.js";
import Line from "../models/LineModel.js";
import Section from "../models/SectionModel.js";
import Department from "../models/DepartmentModel.js";
import Division from "../models/DivisionModel.js";
import Organization from "../models/OrganizationModel.js";
import UserWarehouse from "../models/UserWarehouseModel.js";
import db from "../utils/Database.js";
import Warehouse from "../models/WarehouseModel.js";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import LogMaster from "../models/LogMasterModel.js";

export const getUser = async (req, res) => {
  try {
    const response = await User.findAll({
      where: { flag: 1 },
      attributes: [
        "id",
        "username",
        "name",
        "position",
        "img",
        "noHandphone",
        "email",
        "isProduction",
        "isWarehouse",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Role,
          where: { flag: 1 },
        },
        {
          model: Organization,
          required: false,
          where: { flag: 1 },
          include: [
            {
              model: Group,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Line,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Section,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Department,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Division,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Plant,
              where: { flag: 1 },
            },
          ],
        },
        {
          model: Warehouse,
          through: { attributes: [] },
          where: { flag: 1 },
          required: false,
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "User", action: "create" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
        },
        {
          model: LogMaster,
          required: false,
          as: "updatedBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "User" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 1,
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = await User.findOne({
      where: {
        id: userId,
        flag: 1,
      },
      attributes: [
        "id",
        "username",
        "name",
        "position",
        "img",
        "noHandphone",
        "email",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Role,
          where: { flag: 1 },
        },
        {
          model: Organization,
          required: false,
          where: { flag: 1 },
          include: [
            {
              model: Group,
              where: { flag: 1 },
            },
            {
              model: Line,
              where: { flag: 1 },
            },
            {
              model: Section,
              where: { flag: 1 },
            },
            {
              model: Department,
              where: { flag: 1 },
            },
            {
              model: Division,
              where: { flag: 1 },
            },
            {
              model: Plant,
              where: { flag: 1 },
            },
          ],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  const {
    username,
    password,
    name,
    roleId,
    position,
    img,
    noHandphone,
    email,
    groupId,
    lineId,
    sectionId,
    departmentId,
    divisionId,
    warehouseId,
    organizationId,
    isProduction,
  } = req.body;

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  if (
    (!username || !password || !name || !roleId || !position,
    !organizationId || isProduction == null)
  ) {
    return res.status(400).json({
      message:
        "username, password, name, roleId, position, organization and isProduction must be filled",
    });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({
      where: {
        username,
        flag: 1,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    await User.create(
      {
        username: username,
        password: hashPassword,
        name: name,
        roleId: roleId,
        position: position,
        img: img,
        noHandphone: noHandphone,
        email: email,
        groupId: groupId,
        lineId: lineId,
        sectionId: sectionId,
        departmentId: departmentId,
        divisionId: divisionId,
        warehouseId: warehouseId,
        organizationId: organizationId,
        isProduction: isProduction,
      },
      { userId: req.user.userId }
    );
    res.status(201).json({ message: "User Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.update(req.body, {
      where: {
        id: userId,
        flag: 1,
      },
      individualHooks: true,
      userId: req.user.userId,
    });
    res.status(200).json({ message: "User Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.update(
      { flag: 0 },
      {
        where: { id: userId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUserAndOrg = async (req, res) => {
  const {
    username,
    password,
    confirmPassword,
    name,
    roleId,
    position,
    noHandphone,
    email,
    groupId,
    lineId,
    sectionId,
    departmentId,
    divisionId,
    warehouseIds,
    plantId,
    isProduction,
    isWarehouse,
  } = req.body;

  // Start a transaction
  const transaction = await db.transaction();

  try {
    // Fetch role information
    const role = await Role.findOne({
      where: {
        id: roleId.id,
        flag: 1,
      },
      attributes: ["roleName"],
      transaction, // Pass transaction
    });

    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: "Role not found" });
    }

    // Validate required fields
    let requiredFields = [];
    if (role.roleName.includes("group head")) {
      requiredFields = [
        { field: "username", message: "Username is required" },
        { field: "password", message: "Password is required" },
        { field: "confirmPassword", message: "Confirm Password is required" },
        { field: "name", message: "Fullname is required" },
        { field: "roleId", message: "Role is required" },
        { field: "position", message: "Position is required" },
        { field: "groupId", message: "Group is required" },
        { field: "lineId", message: "Line is required" },
        { field: "sectionId", message: "Section is required" },
        { field: "departmentId", message: "Department is required" },
        { field: "divisionId", message: "Division is required" },
        { field: "warehouseIds", message: "Warehouse Access are required" },
        { field: "plantId", message: "Plant is required" },
        { field: "isProduction", message: "Production is required" },
        { field: "isWarehouse", message: "Warehouse is required" },
      ];
    } else if (role.roleName.includes("line head")) {
      requiredFields = [
        { field: "username", message: "Username is required" },
        { field: "password", message: "Password is required" },
        { field: "confirmPassword", message: "Confirm Password is required" },
        { field: "name", message: "Fullname is required" },
        { field: "roleId", message: "Role is required" },
        { field: "position", message: "Position is required" },
        { field: "lineId", message: "Line is required" },
        { field: "sectionId", message: "Section is required" },
        { field: "departmentId", message: "Department is required" },
        { field: "divisionId", message: "Division is required" },
        { field: "warehouseIds", message: "Warehouse Access are required" },
        { field: "plantId", message: "Plant is required" },
        { field: "isProduction", message: "Production is required" },
        { field: "isWarehouse", message: "Warehouse is required" },
      ];
    } else if (role.roleName.includes("section head")) {
      requiredFields = [
        { field: "username", message: "Username is required" },
        { field: "password", message: "Password is required" },
        { field: "confirmPassword", message: "Confirm Password is required" },
        { field: "name", message: "Fullname is required" },
        { field: "position", message: "Position is required" },
        { field: "sectionId", message: "Section is required" },
        { field: "departmentId", message: "Department is required" },
        { field: "divisionId", message: "Division is required" },
        { field: "warehouseIds", message: "Warehouse Access are required" },
        { field: "plantId", message: "Plant is required" },
        { field: "isProduction", message: "Production is required" },
        { field: "isWarehouse", message: "Warehouse is required" },
      ];
    } else if (role.roleName.includes("department head")) {
      requiredFields = [
        { field: "username", message: "Username is required" },
        { field: "password", message: "Password is required" },
        { field: "confirmPassword", message: "Confirm Password is required" },
        { field: "name", message: "Fullname is required" },
        { field: "position", message: "Position is required" },
        { field: "departmentId", message: "Department is required" },
        { field: "divisionId", message: "Division is required" },
        { field: "warehouseIds", message: "Warehouse Access are required" },
        { field: "plantId", message: "Plant is required" },
        { field: "isProduction", message: "Production is required" },
        { field: "isWarehouse", message: "Warehouse is required" },
      ];
    } else {
      requiredFields = [
        { field: "username", message: "Username is required" },
        { field: "password", message: "Password is required" },
        { field: "confirmPassword", message: "Confirm Password is required" },
        { field: "name", message: "Fullname is required" },
        { field: "position", message: "Position is required" },
        { field: "warehouseIds", message: "Warehouse Access are required" },
        { field: "isProduction", message: "Production is required" },
        { field: "isWarehouse", message: "Warehouse is required" },
      ];
    }

    for (const field of requiredFields) {
      if (!req.body[field.field]) {
        await transaction.rollback();
        return res.status(400).json({
          message: field.message,
        });
      }
    }

    // Validate passwords
    if (password !== confirmPassword) {
      await transaction.rollback();
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    let organizationId;

    // Check if organization exists or create one
    const organization = await Organization.findOne({
      where: {
        groupId: groupId?.id || null,
        lineId: lineId?.id || null,
        sectionId: sectionId?.id || null,
        departmentId: departmentId?.id || null,
        divisionId: divisionId?.id || null,
        plantId: plantId?.id || null,
        flag: 1,
      },
      transaction,
    });

    if (organization) {
      organizationId = organization.id;
    } else {
      const newOrganization = await Organization.create(
        {
          groupId: groupId?.id,
          lineId: lineId?.id,
          sectionId: sectionId?.id,
          departmentId: departmentId?.id,
          divisionId: divisionId?.id,
          plantId: plantId?.id,
        },
        { transaction, userId: req.user.userId }
      );
      organizationId = newOrganization.id;
    }

    // Check for existing user
    const existingUser = await User.findOne({
      where: {
        username,
        flag: 1,
      },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: "Username already exists" });
    }

    // Validate role-specific warehouse access
    if (
      role.roleName === "warehouse staff" ||
      role.roleName === "warehouse member"
    ) {
      if (!warehouseIds || warehouseIds.length > 1) {
        await transaction.rollback();
        return res.status(400).json({
          message: "There can only be 1 warehouse access for this role",
        });
      }
    }

    // Create the user
    const user = await User.create(
      {
        username,
        password: hashPassword,
        name,
        roleId: roleId.id,
        position: position.value,
        noHandphone,
        email,
        groupId: role.roleName === "group head" ? groupId?.id : null,
        lineId: role.roleName === "line head" ? lineId?.id : null,
        sectionId: role.roleName === "section head" ? sectionId?.id : null,
        departmentId:
          role.roleName === "department head" ? departmentId?.id : null,
        divisionId: role.roleName === "division head" ? divisionId?.id : null,
        warehouseId:
          role.roleName === "warehouse staff" ||
          role.roleName === "warehouse member"
            ? warehouseIds[0].id
            : null,
        organizationId,
        isProduction: isProduction.value,
        isWarehouse: isWarehouse.value,
      },
      { transaction, userId: req.user.userId }
    );

    // Create UserWarehouse entries
    for (const warehouseId of warehouseIds) {
      const userWarehouse = await UserWarehouse.findOne({
        where: {
          userId: user.id,
          warehouseId: warehouseId.id,
          flag: 1,
        },
        transaction,
      });

      if (!userWarehouse) {
        await UserWarehouse.create(
          {
            userId: user.id,
            warehouseId: warehouseId.id,
          },
          { transaction, userId: req.user.userId }
        );
      }
    }

    // Commit the transaction
    await transaction.commit();
    res.status(201).json({ message: "User Created" });
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserAndOrg = async (req, res) => {
  const {
    name,
    roleId,
    position,
    noHandphone,
    email,
    groupId,
    lineId,
    sectionId,
    departmentId,
    divisionId,
    warehouseIds,
    plantId,
    isProduction,
    isWarehouse,
  } = req.body;

  const userId = req.params.id;

  // Validasi user ID
  const user = await User.findOne({
    where: {
      id: userId,
      flag: 1,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Cari roleName dari roleId
  const role = await Role.findOne({
    where: {
      id: roleId.id,
      flag: 1,
    },
    attributes: ["roleName"],
  });

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  // Validasi field yang wajib diisi
  let requiredFields = [];
  if (role.roleName.includes("group head")) {
    requiredFields = [
      { field: "name", message: "Fullname is required" },
      { field: "roleId", message: "Role is required" },
      { field: "position", message: "Position is required" },
      { field: "groupId", message: "Group is required" },
      { field: "lineId", message: "Line is required" },
      { field: "sectionId", message: "Section is required" },
      { field: "departmentId", message: "Department is required" },
      { field: "divisionId", message: "Division is required" },
      { field: "warehouseIds", message: "Warehouse Access are required" },
      { field: "plantId", message: "Plant is required" },
      { field: "isProduction", message: "Production is required" },
      { field: "isWarehouse", message: "Warehouse is required" },
    ];
  } else if (role.roleName.includes("line head")) {
    requiredFields = [
      { field: "name", message: "Fullname is required" },
      { field: "roleId", message: "Role is required" },
      { field: "position", message: "Position is required" },
      { field: "lineId", message: "Line is required" },
      { field: "sectionId", message: "Section is required" },
      { field: "departmentId", message: "Department is required" },
      { field: "divisionId", message: "Division is required" },
      { field: "warehouseIds", message: "Warehouse Access are required" },
      { field: "plantId", message: "Plant is required" },
      { field: "isProduction", message: "Production is required" },
      { field: "isWarehouse", message: "Warehouse is required" },
    ];
  } else if (role.roleName.includes("section head")) {
    requiredFields = [
      { field: "name", message: "Fullname is required" },
      { field: "position", message: "Position is required" },
      { field: "sectionId", message: "Section is required" },
      { field: "departmentId", message: "Department is required" },
      { field: "divisionId", message: "Division is required" },
      { field: "warehouseIds", message: "Warehouse Access are required" },
      { field: "plantId", message: "Plant is required" },
      { field: "isProduction", message: "Production is required" },
      { field: "isWarehouse", message: "Warehouse is required" },
    ];
  } else {
    requiredFields = [
      { field: "name", message: "Fullname is required" },
      { field: "position", message: "Position is required" },
      { field: "warehouseIds", message: "Warehouse Access are required" },
      { field: "isProduction", message: "Production is required" },
      { field: "isWarehouse", message: "Warehouse is required" },
    ];
  }

  for (const field of requiredFields) {
    if (!req.body[field.field]) {
      return res.status(400).json({
        message: field.message,
      });
    }
  }

  let organizationId;

  // Start a transaction
  const transaction = await db.transaction();

  try {
    // Check if organization exists
    const organization = await Organization.findOne({
      where: {
        groupId: groupId?.id || null,
        lineId: lineId?.id || null,
        sectionId: sectionId?.id || null,
        departmentId: departmentId?.id || null,
        divisionId: divisionId?.id || null,
        plantId: plantId?.id || null,
        flag: 1,
      },
      transaction, // Pass the transaction object
    });

    if (organization) {
      organizationId = organization.id;
    } else {
      const newOrganization = await Organization.create(
        {
          groupId: groupId?.id,
          lineId: lineId?.id,
          sectionId: sectionId?.id,
          departmentId: departmentId?.id,
          divisionId: divisionId?.id,
          plantId: plantId?.id,
        },
        { userId: req.user.userId, transaction }
      ); // Pass the transaction object
      organizationId = newOrganization.id;
    }

    // Update the user
    await user.update(
      {
        name: name,
        roleId: roleId.id,
        position: position.value,
        noHandphone: noHandphone,
        email: email,
        groupId: role.roleName === "group head" ? groupId?.id : null,
        lineId: role.roleName === "line head" ? lineId?.id : null,
        sectionId: role.roleName === "section head" ? sectionId?.id : null,
        departmentId:
          role.roleName === "department head" ? departmentId?.id : null,
        divisionId: role.roleName === "division head" ? divisionId?.id : null,
        warehouseId:
          role.roleName === "warehouse staff" ||
          role.roleName === "warehouse member"
            ? warehouseIds[0]?.id
            : null,
        organizationId: organizationId,
        isProduction: isProduction.value,
        isWarehouse: isWarehouse.value,
      },
      {
        individualHooks: true,
        userId: req.user.userId,
        transaction,
      }
    );

    // Update UserWarehouse entries
    await UserWarehouse.destroy({
      where: { userId: user.id },
      transaction,
    });

    for (const warehouseId of warehouseIds) {
      await UserWarehouse.create(
        {
          userId: user.id,
          warehouseId: warehouseId.id,
        },
        { userId: req.user.userId, transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addImage = async (req, res) => {
  try {
    const userId = req.params.id;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const imagePath = `/uploads/profiles/${user.username}${path.extname(
      image.originalname
    )}`;

    // Simpan path gambar ke database
    await User.update(
      { img: imagePath },
      {
        where: {
          id: userId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res
      .status(200)
      .json({ message: "Image upload successfully", imgPath: imagePath });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.img) {
      return res.status(404).json({ message: "Image not found" });
    }

    const filePath = `./resources${user.img}`;

    // Periksa apakah file ada sebelum dihapus
    if (fs.existsSync(filePath)) {
      await fsp.unlink(filePath);
    } else {
      console.log("File not found:", filePath);
    }

    await User.update(
      { img: null },
      {
        where: {
          id: userId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
      attributes: [
        "id",
        "username",
        "name",
        "position",
        "img",
        "noHandphone",
        "email",
        "isProduction",
        "isWarehouse",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Role,
          where: { flag: 1 },
        },
        {
          model: Organization,
          required: false,
          where: { flag: 1 },
          include: [
            {
              model: Group,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Line,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Section,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Department,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Division,
              required: false,
              where: { flag: 1 },
            },
            {
              model: Plant,
              where: { flag: 1 },
            },
          ],
        },
        {
          model: Warehouse,
          through: { attributes: [] },
          where: { flag: 1 },
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStructureApproval = async (req, res) => {
  try {
    const groupId = req.user.groupId;
    const lineId = req.user.lineId;
    const sectionId = req.user.sectionId;
    const departmentId = req.user.departmentId;

    const whereCondition = {
      flag: 1,
    };

    if (groupId) whereCondition.groupId = groupId;
    if (lineId) whereCondition.lineId = lineId;
    if (sectionId) whereCondition.sectionId = sectionId;
    if (departmentId) whereCondition.departmentId = departmentId;

    const structureApproval = await Organization.findAll({
      where: whereCondition,
      include: [
        {
          model: Line,
          required: false,
          where: { flag: 1 },
          include: [
            {
              model: User,
              attributes: ["id", "username", "name", "position", "img"],
              where: { flag: 1 },
              required: false,
            },
          ],
        },
        {
          model: Section,
          required: false,
          where: { flag: 1 },
          include: [
            {
              model: User,
              attributes: ["id", "username", "name", "position", "img"],
              where: { flag: 1 },
              required: false,
            },
          ],
        },
        {
          model: Department,
          required: false,
          where: { flag: 1 },
          include: [
            {
              model: User,
              attributes: ["id", "username", "name", "position", "img"],
              where: { flag: 1 },
              required: false,
            },
          ],
        },
      ],
    });

    if (!structureApproval) {
      return res.status(404).json({ message: "Structure approval not found" });
    }
    res.status(200).json(structureApproval);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
