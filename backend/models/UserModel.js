import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Role from "./RoleModel.js";
import Group from "./GroupModel.js";
import Line from "./LineModel.js";
import Section from "./SectionModel.js";
import Warehouse from "./WarehouseModel.js";
import Department from "./DepartmentModel.js";
import Division from "./DivisionModel.js";
import Organization from "./OrganizationModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const User = db.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noreg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Role,
        key: "id",
      },
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    noHandphone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Group,
        key: "id",
      },
    },
    lineId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Line,
        key: "id",
      },
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Section,
        key: "id",
      },
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Department,
        key: "id",
      },
    },
    divisionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Division,
        key: "id",
      },
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Warehouse,
        key: "id",
      },
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Organization,
        key: "id",
      },
    },
    isProduction: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isWarehouse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
  }
);

Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

Group.hasMany(User, { foreignKey: "groupId", onDelete: "SET NULL" });
User.belongsTo(Group, { foreignKey: "groupId", onDelete: "SET NULL" });

Line.hasMany(User, { foreignKey: "lineId", onDelete: "SET NULL" });
User.belongsTo(Line, { foreignKey: "lineId", onDelete: "SET NULL" });

Section.hasMany(User, { foreignKey: "sectionId", onDelete: "SET NULL" });
User.belongsTo(Section, { foreignKey: "sectionId", onDelete: "SET NULL" });

// Warehouse.hasMany(User, { foreignKey: "warehouseId", onDelete: "NO ACTION" });
// User.belongsTo(Warehouse, { foreignKey: "warehouseId", onDelete: "NO ACTION" });

Department.hasMany(User, { foreignKey: "departmentId", onDelete: "SET NULL" });
User.belongsTo(Department, {
  foreignKey: "departmentId",
  onDelete: "SET NULL",
});

Division.hasMany(User, { foreignKey: "divisionId", onDelete: "SET NULL" });
User.belongsTo(Division, { foreignKey: "divisionId", onDelete: "SET NULL" });

Organization.hasMany(User, {
  foreignKey: "organizationId",
  onDelete: "SET NULL",
});
User.belongsTo(Organization, {
  foreignKey: "organizationId",
  onDelete: "SET NULL",
});

User.belongsTo(Warehouse, {
  as: "alternateWarehouse",
  foreignKey: "anotherWarehouseId",
  constraints: false,
});

// HOOKS
User.addHook("afterCreate", async (user, options) => {
  await LogMaster.create({
    masterType: "User",
    masterId: user.id,
    action: "create",
    changes: JSON.stringify(user),
    userId: options.userId,
  });
});

User.addHook("afterUpdate", async (user, options) => {
  try {
    // Ambil perubahan yang terjadi
    const changes = user._previousDataValues;
    const updatedData = user.dataValues;

    // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
    if (changes.flag === 1 && updatedData.flag === 0) {
      // Catat log untuk soft delete
      await LogMaster.create({
        masterType: "User",
        masterId: user.id,
        action: "softDelete",
        changes: JSON.stringify({
          old: changes,
          new: updatedData, // Menyertakan data setelah update
        }),
        userId: options.userId,
      });
    } else if (user.changed("password")) {
      // Catat log untuk perubahan password
      await LogMaster.create({
        masterType: "User",
        masterId: user.id,
        action: "passwordChange",
        changes: JSON.stringify({
          old: changes,
          new: updatedData,
        }),
        userId: options.userId,
      });
    } else {
      // Catat log untuk update biasa
      await LogMaster.create({
        masterType: "User",
        masterId: user.id,
        action: "update",
        changes: JSON.stringify({
          old: changes, // Data sebelum update
          new: updatedData, // Data setelah update
        }),
        userId: options.userId,
      });
    }
  } catch (error) {
    console.error("Error dalam afterUpdate hook:", error);
  }
});

export default User;
