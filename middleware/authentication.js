var jwt = require('jsonwebtoken');

var config = require('../config/config');

//========================================
// Validate token
//========================================
module.exports.tokenValidation = function(req, res, next){

    var token = req.query.token;

    jwt.verify(token, config.SEED, (err, decoded) => {

        if(err){

            return res.status(401).json({
                ok: false,
                message: "Invalid token",
                errors: err
            });
        }

        req.user = decoded.user;

        next();
    });
};

//========================================
// Validate admin role
//========================================
module.exports.adminRoleValidation = function(req, res, next){

    var user = req.user;
    var id = req.params.id;

    if(user.role == 'ADMIN_ROLE' || user.id == id){

        next();
        return;

    } else {

        return res.status(401).json({
            ok: false,
            message: "Invalid Role"
        });
    }
};