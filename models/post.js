'use strict';
import {
  Model
} from 'sequelize';

export default (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
      });

      Post.belongsToMany(models.Tag, {
        through: models.PostTag,
      });
    }
  }
  Post.init({
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};