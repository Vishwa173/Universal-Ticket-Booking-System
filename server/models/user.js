import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provider: {
    type: DataTypes.STRING,
    defaultValue: 'local',
  },
  profilePic: {
    type: DataTypes.STRING,
    field: 'profile_pic',
  },
  createdAt: {
  type: DataTypes.DATE,
  field: 'created_at',
  defaultValue: DataTypes.NOW,
},

  wallet: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    allowNull: false,
  },

  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  banReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  banUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'users',
  timestamps: false,
});

export default User;
