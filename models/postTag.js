'use strict';
import {
  Model
} from 'sequelize';

export default (sequelize, DataTypes) => {
  class PostTag extends Model {
    static associate(models) {
    }
  }
  PostTag.init({
    PostId: DataTypes.INTEGER,
    TagId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'PostTag',
    tableName: 'Post_Tag',
    timestamps: false,
  });
  return PostTag;
};