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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      allowNull: false,
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

Group.hasMany(User, { foreignKey: "groupId", onDelete: "NO ACTION" });
User.belongsTo(Group, { foreignKey: "groupId", onDelete: "NO ACTION" });

Line.hasMany(User, { foreignKey: "lineId", onDelete: "NO ACTION" });
User.belongsTo(Line, { foreignKey: "lineId", onDelete: "NO ACTION" });

Section.hasMany(User, { foreignKey: "sectionId", onDelete: "NO ACTION" });
User.belongsTo(Section, { foreignKey: "sectionId", onDelete: "NO ACTION" });

// Warehouse.hasMany(User, { foreignKey: "warehouseId", onDelete: "NO ACTION" });
// User.belongsTo(Warehouse, { foreignKey: "warehouseId", onDelete: "NO ACTION" });

Department.hasMany(User, { foreignKey: "departmentId", onDelete: "NO ACTION" });
User.belongsTo(Department, {
  foreignKey: "departmentId",
  onDelete: "NO ACTION",
});

Division.hasMany(User, { foreignKey: "divisionId", onDelete: "NO ACTION" });
User.belongsTo(Division, { foreignKey: "divisionId", onDelete: "NO ACTION" });

Organization.hasMany(User, {
  foreignKey: "organizationId",
  onDelete: "NO ACTION",
});
User.belongsTo(Organization, {
  foreignKey: "organizationId",
  onDelete: "NO ACTION",
});

User.belongsTo(Warehouse, {
  as: "alternateWarehouse",
  foreignKey: "anotherWarehouseId",
  constraints: false,
});

// HOOKS
User.addHook("afterCreate", async (user, options) => {
  await LogMaster.create(
    {
      masterType: "User",
      masterId: user.id,
      action: "create",
      changes: JSON.stringify(user),
      userId: options.userId,
    },
    { transaction: options.transaction }
  );
});

User.addHook("afterUpdate", async (user, options) => {
  // Ambil perubahan yang terjadi
  const changes = user._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = user.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "User",
      masterId: user.id,
      action: "softDelete",
      changes: JSON.stringify(
        {
          old: changes,
          new: updatedData, // Menyertakan data setelah update
        },
        { transaction: options.transaction }
      ),
      userId: options.userId,
    });
  } else {
    // Catat log untuk update biasa
    await LogMaster.create(
      {
        masterType: "User",
        masterId: user.id,
        action: "update",
        changes: JSON.stringify({
          old: changes, // Data sebelum update
          new: updatedData, // Data setelah update
        }),
        userId: options.userId,
      },
      { transaction: options.transaction }
    );
  }
});

export default User;
