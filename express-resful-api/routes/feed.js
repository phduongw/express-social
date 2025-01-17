const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');

router.get('/post', feedController.getPosts);
router.post('/post', feedController.createNewPost);

module.exports = router;