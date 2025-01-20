const express = require('express');
const router = express.Router();
const {body} = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../midleware/is-auth');


router.get('/post', isAuth, feedController.getPosts);
router.post('/post',
    isAuth, [
        body('title')
            .trim()
            .isLength({
                min: 5
            }),
        body('content')
            .trim()
            .isLength({
                min: 5
            }),
    ], feedController.createNewPost);

router.get('/post/:postId', isAuth, feedController.getPost);
router.put('/post/:postId', isAuth, [
    body('title')
        .trim()
        .isLength({
            min: 5
        }),
    body('content')
        .trim()
        .isLength({
            min: 5
        }),
], feedController.editPost);
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;