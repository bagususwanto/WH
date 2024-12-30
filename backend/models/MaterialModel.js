import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Supplier from "./SupplierModel.js";
import Category from "./CategoryModel.js";
import Packaging from "./PackagingModel.js";
import LogImport from "./LogImportModel.js";
import LogMaster from "./LogMasterModel.js";

const { DataTypes } = Sequelize;

const Material = db.define(
  "Material",
  {
    materialNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mrpType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    minOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    packagingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Packaging,
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Supplier,
        key: "id",
      },
    },
    logImportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LogImport,
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

Category.hasMany(Material, { foreignKey: "categoryId" });
Material.belongsTo(Category, { foreignKey: "categoryId" });

Supplier.hasMany(Material, { foreignKey: "supplierId" });
Material.belongsTo(Supplier, { foreignKey: "supplierId" });

Packaging.hasMany(Material, { foreignKey: "packagingId" });
Material.belongsTo(Packaging, { foreignKey: "packagingId" });

LogImport.hasMany(Material, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});
Material.belongsTo(LogImport, {
  foreignKey: "logImportId",
  onDelete: "NO ACTION",
});

Material.addHook("afterCreate", async (material, options) => {
  await LogMaster.create({
    masterType: "Material",
    masterId: material.id,
    action: "create",
    changes: JSON.stringify(material),
    userId: options.userId,
  });
});

Material.addHook("afterUpdate", async (material, options) => {
  // Ambil perubahan yang terjadi
  const changes = material._previousDataValues;

  // Bandingkan nilai lama (sebelumnya) dengan nilai baru (sekarang)
  const updatedData = material.dataValues;

  // Periksa apakah hanya perubahan pada field `flag` menjadi 0 (soft delete)
  if (changes.flag === 1 && updatedData.flag === 0) {
    // Catat log untuk soft delete
    await LogMaster.create({
      masterType: "Material",
      masterId: material.id,
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
      masterType: "Material",
      masterId: material.id,
      action: "update",
      changes: JSON.stringify({
        old: changes, // Data sebelum update
        new: updatedData, // Data setelah update
      }),
      userId: options.userId,
    });
  }
});

export default Material;
