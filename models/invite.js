'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Invite extends Model {
  }

  Invite.init(
    {
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Invite',
    }
  );

  return Invite;
};
