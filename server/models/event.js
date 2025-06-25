import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  date: DataTypes.DATE,
  time: DataTypes.STRING,
  location: DataTypes.STRING,
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General',
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  currentPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
});

export default Event;
