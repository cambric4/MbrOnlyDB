// routes/auth.js

import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import { User } from '../models/index.js';

const router = express.Router();
const MEMBERSHIP_CODE = process.env.MEMBERSHIP_CODE || 'default-secret';

// Helper to ensure user is logged out before accessing auth pages
const isLoggedOut = (req, res, next) => {
    if (!req.isAuthenticated()) { return next(); }
    res.redirect('/');
};

// GET sign-up form
router.get('/signup', isLoggedOut, (req, res) => {
    res.render('signup', { title: 'Sign Up', errors: req.flash('validation_errors') });
});

// POST sign-up logic
router.post('/signup', isLoggedOut, [
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required.'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required.'),
    body('username').isEmail().withMessage('Username must be a valid email.').custom(async (value) => {
        const user = await User.findOne({ where: { username: value } });
        if (user) { throw new Error('Email already in use.'); }
    }),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) { throw new Error('Passwords do not match.'); }
        return true;
    }),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validation_errors', errors.array());
        return res.redirect('/auth/signup');
    }

    try {
        await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: req.body.password,
            // Admin checkbox logic: If present and checked, set true.
            admin: req.body.admin === 'on'
        });
        req.flash('success', 'Sign up successful! Please log in and join the club.');
        res.redirect('/auth/login');
    } catch (err) {
        next(err);
    }
});


// GET login form
router.get('/login', isLoggedOut, (req, res) => {
    res.render('login', { title: 'Login' });
});

// POST login logic
router.post('/login', isLoggedOut, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// GET join club form
router.get('/join', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to join the club.');
        return res.redirect('/auth/login');
    }
    if (req.user.membershipStatus) {
        req.flash('success', 'You are already a member!');
        return res.redirect('/');
    }
    res.render('join', { title: 'Join the Club' });
});

// POST join club logic (Passcode check)
router.post('/join', async (req, res, next) => {
    if (!req.isAuthenticated()) { return res.redirect('/auth/login'); }

    if (req.body.passcode === MEMBERSHIP_CODE) {
        try {
            await req.user.update({ membershipStatus: true });
            req.flash('success', 'Success! Welcome to the exclusive club!');
            return res.redirect('/');
        } catch (err) {
            next(err);
        }
    } else {
        req.flash('error', 'Incorrect secret passcode.');
        return res.redirect('/auth/join');
    }
});

// GET logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', 'You have been logged out.');
        res.redirect('/');
    });
});

export default router;