import LogMaster from "./LogMasterModel.js";
import Material from "./MaterialModel.js";
import User from "./UserModel.js";

const logMasterAssociations = () => {
  User.hasMany(LogMaster, { foreignKey: "userId", onDelete: "NO ACTION" });
  LogMaster.belongsTo(User, { foreignKey: "userId", onDelete: "NO ACTION" });

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
};

export default logMasterAssociations;
