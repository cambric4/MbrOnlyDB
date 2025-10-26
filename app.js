// app.js

import dotenv from 'dotenv';
import path from 'path';

// Load .env first
dotenv.config({ path: path.resolve('./.env') });

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';

import configurePassport from './config/passport.js';
import { syncDb } from './models/index.js';

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
  await syncDb({ force: false }); // sync models (set force: true to wipe DB on start)
  app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
  });
}

start().catch(err => {
  console.error('Failed to start app:', err);
});