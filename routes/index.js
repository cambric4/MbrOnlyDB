// routes/index.js

import express from 'express';
import { Message, User } from '../models/index.js';

const router = express.Router();

// GET home page with all messages
router.get('/', async (req, res, next) => {
    try {
        // Fetch all messages and INCLUDE the author's details
        const messages = await Message.findAll({
            include: [{
                model: User,
                as: 'author',
                attributes: ['firstName', 'lastName', 'username', 'membershipStatus', 'admin'],
            }],
            order: [['timestamp', 'DESC']]
        });

        res.render('index', { 
            title: 'Members Only Club',
            messages: messages
        });
    } catch (err) {
        next(err);
    }
});

export default router;