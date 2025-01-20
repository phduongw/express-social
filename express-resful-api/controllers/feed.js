const { validationResult } = require('express-validator')
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
    const { page } = req.query || 1;
    const limit = 2;
    let total;
    Post.find().countDocuments()
        .then(count => {
            total = count;
            return Post.find()
                .skip((page - 1) * limit)
                .limit(limit);
        })
        .then(posts => {
            res.status(200)
                .json({
                    message: 'Fetched posts successfully',
                    posts,
                    totalItems: total,
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

exports.createNewPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect!");
        error.statusCode = 422
        throw error;
    }

    if (!req.file) {
        const error = new Error("File is required!");
        error.statusCode = 422
        throw error;
    }
    const normalizedPath = req.file.path.replace(/\\/g, '/');
    const { title, content } = req.body;
    const userId = req.userId;
    let creator;
    const post = new Post({
        title,
        content,
        imageUrl: normalizedPath,
        creator: userId
    })

    post.save()
        .then(result => {
            console.log(result);
            return User.findById(userId)
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then(result => {
            res.status(201)
                .json({
                    message: 'Post created successfully.',
                    post: result,
                    creator: {
                        _id: creator._id,
                        name: creator.name
                    }
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        })
}

exports.getPost = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post not found!");
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                message: 'Post found successfully.',
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        })
}

exports.editPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect!");
        error.statusCode = 422
        throw error;
    }

    const { postId } = req.params;
    const { title, content } = req.body;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }

    if (!imageUrl) {
        const error = new Error("No file picked!");
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post not found!");
                error.statusCode = 422
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }

            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content

            post.save();
        })
        .then(result => {
            res.status(200).json({
                message: "Post updated!",
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        })
}

exports.deletePost = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post not found!");
                error.statusCode = 422
                throw error;
            }

            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId)
        })
        .then(result => {
            console.log(result)
            res.status(200).json({
                message: "Post deleted!",
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err))
}