'use strict';
import {
  Model
} from 'sequelize';

export default (sequelize, DataTypes) => {
  class PasteLanguage extends Model {
    static associate(models) {
    }
  }
  PasteLanguage.init({
    pasteId: DataTypes.INTEGER,
    languageId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'PasteLanguage',
    tableName: 'Paste_Language',
    timestamps: false,
  });
  return PasteLanguage;
};