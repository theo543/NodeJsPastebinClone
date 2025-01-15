'use strict';

const undoPost = require('./20241211155813-create-post.js').up;
const undoTag = require('./20241218155933-create-tag.js').up;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.dropTable('Posts');
    queryInterface.dropTable('Tags');
  },

  async down (queryInterface, Sequelize) {
    await undoPost(queryInterface, Sequelize);
    await undoTag(queryInterface, Sequelize);
  }
};
