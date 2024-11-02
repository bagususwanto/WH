// import { Sequelize } from "sequelize";
// import db from "../utils/Database.js";
// import Plant from "./PlantModel.js";
// import Division from "./DivisionModel.js";

// const { DataTypes } = Sequelize;

// const DivisionPlant = db.define(
//   "Division_Plant",
//   {
//     plantId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: Plant,
//         key: "id",
//       },
//     },
//     divisionId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: Division,
//         key: "id",
//       },
//     },
//     flag: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 1,
//     },
//   },
//   {
//     freezeTableName: true,
//   }
// );

// Plant.belongsToMany(Division, { through: DivisionPlant, foreignKey: "plantId" });
// Division.belongsToMany(Plant, { through: DivisionPlant, foreignKey: "divisionId" });

// export default DivisionPlant;
