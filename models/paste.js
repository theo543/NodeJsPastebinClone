'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Paste extends Model {
    static associate(models) {
      Paste.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }
  }
  Paste.init({
    name: DataTypes.STRING,
    privacy_level: DataTypes.STRING,
    expiration_time: DataTypes.DATE,
    user_id: DataTypes.INTEGER,
    language_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Paste',
  });
  return Paste;
};