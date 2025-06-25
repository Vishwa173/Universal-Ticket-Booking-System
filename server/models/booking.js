import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Event from './event.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  bookedSeats: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },

  seatsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: 'confirmed',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(Booking, { foreignKey: 'eventId' });
Booking.belongsTo(Event, { foreignKey: 'eventId' });

export default Booking;
