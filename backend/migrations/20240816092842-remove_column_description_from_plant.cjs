"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Plant", "description");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Plant", "description", {
      type: Sequelize.TEXT,
    });
  },
};
