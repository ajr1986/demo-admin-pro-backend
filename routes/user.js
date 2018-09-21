var express = require('express');
var bcrypt = require('bcryptjs');

var mwAuthentication = require('../middleware/authentication');

var app = express();

var User = require('../modules/user');

//========================================
// Get users
//========================================
app.get('/', (req, res, next) => {

    User.find({}, "name email img role").exec( (err, users) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: "Fail to get users",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            users: users
        });

    })
});

//========================================
// Create user
//========================================
app.post('/', mwAuthentication.tokenValidation, (req, res, next) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save( (err, userPersisted ) => {

        if(err){

            return res.status(400).json({
                ok: false,
                message: "Fail to create user",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userPersisted
        });
    });
});

//========================================
// Update user
//========================================
app.put("/:id", mwAuthentication.tokenValidation, (req, res, next) => {

    var id = req.params.id;

    User.findById(id, (err, user) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: "Fail to get user",
                errors: err
            });
        }

        if(!user){

            return res.status(400).json({
                ok: false,
                message: "User does not exist"
            });
        }

        var body = req.body;

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userUpdated) => {

            if(err){

                return res.status(500).json({
                    ok: false,
                    message: "Fail to update user",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                user: userUpdated
            });
        });
    });
});

//========================================
// Delete user
//========================================
app.delete("/:id", mwAuthentication.tokenValidation, (req, res, next) => {

    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userDeleted) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: "Fail to delete user",
                errors: err
            });
        }

        if(!userDeleted){

            return res.status(400).json({
                ok: false,
                message: "User does not exist"
            });
        }

        res.status(200).json({
            ok: true,
            user: userDeleted
        });
    });
});

module.exports = app;