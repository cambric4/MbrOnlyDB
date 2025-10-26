// models/index.js

import dotenv from 'dotenv';
import path from 'path';
import { createRequire } from 'module'; 

// Use the Node.js createRequire utility for reliable CommonJS loading
const require = createRequire(import.meta.url); 

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// FIX: Use require() to load the Sequelize CommonJS module correctly
const { Sequelize, DataTypes } = require('sequelize'); 

// 1. Declare connectionString ONLY ONCE
const connectionString = process.env.DATABASE_URL; 
if (!connectionString) {
  throw new Error('DATABASE_URL not set in .env');
}

export const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, // Set to true to see SQL queries
});

// import models
import UserModel from './user.js';
import MessageModel from './message.js';

export const User = UserModel(sequelize, DataTypes);
export const Message = MessageModel(sequelize, DataTypes);

// Relations: 1:M (User has many Messages)
User.hasMany(Message, { foreignKey: 'userId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// helper to sync
export async function syncDb({ force = false } = {}) {
  await sequelize.authenticate();
  await sequelize.sync({ force });
}

export default { sequelize, User, Message, syncDb };