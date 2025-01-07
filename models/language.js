'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Language extends Model {
    static associate(models) {
      // TBA
    }
  }
  Language.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Language',
  });
  return Language;
};