'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Pastes', 'user_id', 'userId');
    await queryInterface.renameColumn('Pastes', 'language_id', 'languageId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Pastes', 'userId', 'user_id');
    await queryInterface.renameColumn('Pastes', 'languageId', 'language_id');
  }
};
