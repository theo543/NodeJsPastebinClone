'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Language extends Model {
    static associate(models) {
      Language.belongsToMany(models.Paste, {
        through: models.PasteLanguage
      });
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