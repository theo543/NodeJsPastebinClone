'use strict';
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tags = new Array(100).fill().map(() => {
      return {
        name: faker.lorem.word(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    })

    await queryInterface.bulkInsert('Tags', tags, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
