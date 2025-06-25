import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'password_reset_tokens',
  timestamps: false,
});

export default PasswordResetToken; 
