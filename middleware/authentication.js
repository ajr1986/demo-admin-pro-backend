var jwt = require('jsonwebtoken');

var config = require('../config/config');

//========================================
// Validate token
//========================================
module.exports.tokenValidation = function(req, res, next){

    var token = req.query.token;

    jwt.verify(token, config.SEED, (err, decoded) => {

        if(err){

            res.status(401).json({
                ok: false,
                message: "Invalid token",
                errors: err
            });
        }

        req.user = decoded.user;

        next();
    });
};