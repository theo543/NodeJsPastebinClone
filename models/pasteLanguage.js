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
    paste_id: DataTypes.INTEGER,
    language_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'PasteLanguage',
    tableName: 'Paste_Language',
    timestamps: false,
  });
  return PasteLanguage;
};