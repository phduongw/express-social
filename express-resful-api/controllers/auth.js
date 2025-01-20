const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();

        throw error;
    }

    const {name, email, password} = req.body;
    bcrypt
        .hash(password, 12)
        .then((hash) => {
            const user = new User({
                email,
                password: hash,
                name,
            });
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: "User Created",
                userId: result._id,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

exports.login = (req, res, next) => {
    const {email, password} = req.body;
    let loadedUser;
    User.findOne({
        email: email,
    }).then((user) => {
        console.log("user: ", user)
        if (!user) {
            console.log("Email doesn't exist");
            const error = new Error("Email or Password doesn't exists!");
            error.statusCode = 401;
            throw error;
        }

        loadedUser = user;
        return bcrypt.compare(password, user.password)
    }).then(isEqual => {
        if (!isEqual) {
            console.log("Password isn't match");
            const error = new Error("Email or Password doesn't exists!");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString(),
            },
            'supersecretsupersecretsupersecretsupersecret',
            {
                expiresIn: '1h'
            });

        res.status(200).json({
            token,
            userId: loadedUser._id.toString(),
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    })
}