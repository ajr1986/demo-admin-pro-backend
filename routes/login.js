var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var config = require('../config/config');

var app = express();

var User = require('../modules/user');


app.post("/", (req, res, next) => {

    var body = req.body;

    User.findOne({email: body.email}, (err, user) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: "Fail login",
                errors: err
            });
        }

        if(!user){

            return res.status(400).json({
                ok: false,
                message: "Invalid credentials - email"
            });
        }

        if(!bcrypt.compareSync(body.password, user.password)){

            return res.status(400).json({
                ok: false,
                message: "Invalid credentials - password"
            });
        }

        user.password = '';
        // generate jwt
        var token = jwt.sign({user: user}, config.SEED, {expiresIn: 3600}); // 1 hour

        return res.status(200).json({
            ok: true,
            message: "Login ok",
            user: user,
            id: user.id,
            token: token
        });

    });

});


module.exports = app;