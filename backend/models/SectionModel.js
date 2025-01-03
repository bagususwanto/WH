import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import WBS from "./WBSModel.js";
import GIC from "./GICModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Section = db.define(
  "Section",
  {
    sectionCode: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    sectionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GIC,
        key: "id",
      },
    },
    wbsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WBS,
        key: "id",
      },
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


GIC.hasMany(Section, { foreignKey: "gicId" });
Section.belongsTo(GIC, { foreignKey: "gicId" });

WBS.hasMany(Section, { foreignKey: "wbsId" });
Section.belongsTo(WBS, { foreignKey: "wbsId" });

// HOOKS
Section.addHook("afterCreate", async (section, options) => {
  await LogMaster.create({
    masterType: "Section",
    masterId: section.id,
    action: "create",
    changes: JSON.stringify(section),
    userId: options.userId,
  });
});

Section.addHook("afterUpdate", async (section, options) => {
  // Ambil perubahan yang terjadi
  const changes = section._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = section.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Section",
      masterId: section.id,
      action: "softDelete",
      changes: JSON.stringify({
        old: changes,
        new: updatedData, // Menyertakan data setelah update
      }),
      userId: options.userId,
    });
  } else {
    // Catat log untuk update biasa
    await LogMaster.create({
      masterType: "Section",
      masterId: section.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Section;
