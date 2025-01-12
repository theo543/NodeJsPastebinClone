'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pastes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      privacy_level: {
        allowNull: false,
        type: Sequelize.STRING
      },
      expiration_time: {
        type: Sequelize.DATE
      },
      body: {
        allowNull: false,
        type: Sequelize.STRING
      },
      user_id:{
        allowNull: false,
        references: {
          model: {
            tableName: 'Users',
          },
          key: 'id',
        },
        type: Sequelize.INTEGER
      },
      language_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Languages',
          },
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pastes');
  }
};