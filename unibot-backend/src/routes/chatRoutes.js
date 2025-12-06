const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Main chat endpoint
router.post('/message', chatController.sendMessage);

// Search knowledge base endpoint
router.post('/search', chatController.searchKnowledge);

module.exports = router;