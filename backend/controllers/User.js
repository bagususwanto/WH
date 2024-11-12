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

export const getUser = async (req, res) => {
  try {
    const response = await User.findAll({
      where: { flag: 1 },
      attributes: ["id", "username", "name", "position", "img", "noHandphone", "email", "createdAt", "updatedAt"],
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
      attributes: ["id", "username", "name", "position", "img", "noHandphone", "email", "createdAt", "updatedAt"],
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

  if ((!username || !password || !name || !roleId || !position, !organizationId || isProduction == null)) {
    return res.status(400).json({ message: "username, password, name, roleId, position, organization and isProduction must be filled" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
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

    await User.create({
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
    });
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

    await User.update({ flag: 0 }, { where: { id: userId, flag: 1 } });

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
    plantId,
    isProduction,
  } = req.body;

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  if (!username || !password || !name || !roleId || !position || !warehouseId || isProduction == null) {
    return res.status(400).json({ message: "username, password, name, roleId, position, warehouseId and isProduction must be filled" });
  }

  let organizationId;

  // Start a transaction
  const transaction = await db.transaction();

  try {
    // Check if organization exists
    const organization = await Organization.findOne({
      where: {
        groupId: groupId || null,
        lineId: lineId || null,
        sectionId: sectionId || null,
        departmentId: departmentId || null,
        divisionId: divisionId || null,
        plantId: plantId || null,
        flag: 1,
      },
      transaction, // Pass the transaction object
    });

    if (organization) {
      organizationId = organization.id;
    } else {
      const newOrganization = await Organization.create(
        {
          groupId: groupId,
          lineId: lineId,
          sectionId: sectionId,
          departmentId: departmentId,
          divisionId: divisionId,
          plantId: plantId,
        },
        { transaction }
      ); // Pass the transaction object
      organizationId = newOrganization.id;
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      where: {
        username,
        flag: 1,
      },
      transaction, // Pass the transaction object
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const role = await Role.findOne({
      where: {
        id: roleId,
      },
      transaction, // Pass the transaction object
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Create the user
    const user = await User.create(
      {
        username: username,
        password: hashPassword,
        name: name,
        roleId: roleId,
        position: position,
        img: img,
        noHandphone: noHandphone,
        email: email,
        groupId: role.roleName === "group head" ? groupId : null,
        lineId: role.roleName === "line head" ? lineId : null,
        sectionId: role.roleName === "section head" ? sectionId : null,
        departmentId: role.roleName === "department head" ? departmentId : null,
        divisionId: role.roleName === "division head" ? divisionId : null,
        warehouseId: role.roleName === "warehouse staff" || role.roleName === "warehouse member" ? warehouseId : null,
        organizationId: organizationId,
        isProduction: isProduction,
        anotherWarehouseId: warehouseId,
      },
      { transaction }
    ); // Pass the transaction object

    const userWarehouse = await UserWarehouse.findOne({
      where: {
        userId: user.id,
        warehouseId: warehouseId,
        flag: 1,
      },
    });

    if (!userWarehouse) {
      await UserWarehouse.create(
        {
          userId: user.id,
          warehouseId: warehouseId,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();
    res.status(201).json({ message: "User Created" });
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
