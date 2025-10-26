// app.js

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });

import dbPool from './config/db.js';

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';

import configurePassport from './config/passport.js';
import { syncDb } from './models/index.js'; // This likely relies on Sequelize/ORM setup

import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import messagesRouter from './routes/messages.js';


const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); // For form data
app.use(express.static('public')); // For CSS/static files

app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

configurePassport();

// Middleware to make user and flash messages available to all views
app.use((req, res, next) => {
  // Expose user details for display/RBAC
  res.locals.currentUser = req.user || null;
  // Expose flash messages
  res.locals.errors = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.validation_errors = req.flash('validation_errors');
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/messages', messagesRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const port = process.env.PORT || 3000;

async function start() {
  // 2. Perform a connection test before starting the server
  try {
    const client = await dbPool.connect();
    console.log('PostgreSQL connection successful!');
    client.release();
  } catch (err) {
    // If connection fails, log the specific ECONNREFUSED error and stop
    console.error('Failed to connect to PostgreSQL. Is the server running?');
    console.error(err);
    // Exit the process so the application doesn't start without a DB
    process.exit(1);
  }

  // If connection is good, proceed to sync models and start server
  await syncDb({ force: false }); // sync models (set force: true to wipe DB on start)
  
  app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
  });
}

start().catch(err => {
  console.error('Failed to start app:', err);
});