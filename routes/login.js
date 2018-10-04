var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');



var config = require('../config/config');

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

var app = express();

var User = require('../modules/user');

//========================================
// Normal Authentication
//========================================
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

//========================================
// Google Authentication
//========================================
app.post('/google', async (req, res, next) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch( err => {

            return res.status(403).json({
                ok: false,
                message: "Invalid token",
                errors: err
            });
        });
    
    User.findOne({email: googleUser.email}, (err, user) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: "Fail to try authenticate",
                errors: err
            });
        }

        if(user){

            if(user.google){

                // generate jwt
                var token = jwt.sign({user: user}, config.SEED, {expiresIn: 3600}); // 1 hour

                return res.status(200).json({
                    ok: true,
                    message: "Login ok",
                    user: user,
                    id: user.id,
                    token: token
                });

            } else {

                return res.status(400).json({
                    ok: false,
                    message: "Please try using normal login"
                });
            }

        } else {

            var newUser = new User({
                name: googleUser.name,
                email: googleUser.email,
                password: ':)',
                img: googleUser.img,
                google: true
            });

            newUser.save((err, userSaved) => {

                if(err){

                    return res.status(500).json({
                        ok: false,
                        message: "Fail to try authenticate",
                        errors: err
                    });
                }

                // generate jwt
                var token = jwt.sign({user: userSaved}, config.SEED, {expiresIn: 3600}); // 1 hour

                return res.status(200).json({
                    ok: true,
                    message: "Login ok",
                    user: userSaved,
                    id: userSaved.id,
                    token: token
                });
            });
        }
    });
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}


module.exports = app;