// routes/messages.js

import express from 'express';
import { body, validationResult } from 'express-validator';
import { Message } from '../models/index.js';

const router = express.Router();

// Middleware to ensure user is logged in
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('error', 'You must be logged in to access that page.');
    res.redirect('/auth/login');
}

// Middleware to ensure user is an admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }
    req.flash('error', 'Access denied. Must be an administrator.');
    res.redirect('/');
}

// GET new message form
router.get('/new', isAuthenticated, (req, res) => {
    res.render('new_message', { title: 'Create Message', errors: req.flash('validation_errors') });
});

// POST new message logic
router.post('/new', isAuthenticated, [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required.'),
    body('text').trim().isLength({ min: 1 }).withMessage('Text content is required.'),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validation_errors', errors.array());
        return res.redirect('/messages/new');
    }

    try {
        await Message.create({
            title: req.body.title,
            text: req.body.text,
            userId: req.user.id // Link to logged-in user
        });
        req.flash('success', 'Message created successfully!');
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

// POST delete message logic (ADMIN ONLY)
router.post('/:id/delete', isAdmin, async (req, res, next) => {
    try {
        const messageId = req.params.id;
        // Optional: Check if the message actually exists first
        await Message.destroy({ where: { id: messageId } });
        
        req.flash('success', 'Message deleted.');
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

export default router;