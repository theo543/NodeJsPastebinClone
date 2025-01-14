'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Paste extends Model {
    static associate(models) {
      Paste.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      Paste.hasOne(models.Language, {
        foreignKey: 'id',
        sourceKey: 'languageId',
      });
    }
  }
  Paste.init({
    name: DataTypes.STRING,
    privacy_level: DataTypes.STRING,
    expiration_time: DataTypes.DATE,
    body: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    languageId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Paste',
  });
  return Paste;
};