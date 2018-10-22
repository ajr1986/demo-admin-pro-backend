var express = require('express');
var bcrypt = require('bcryptjs');
var config = require('../config/config');

var mwAuthentication = require('../middleware/authentication');

var app = express();

var User = require('../modules/user');
var Hospital = require('../modules/hospital');
var Doctor = require('../modules/doctor');

//========================================
// Search users
//========================================
app.get('/users/:text', (req, res, next) => {

    var text = req.params.text;
    var regex = new RegExp(text, 'i');

    searchUsers(text, regex)
    .then(users => {

        res.status(200).json({
            ok: true,
            users: users
        });
    })
    .catch((message, err) => {

        res.status(500).json({
            ok: false,
            message: message,
            errors: err
        });
    });
});

//========================================
// Search hospitals
//========================================
app.get('/hospitals/:text', (req, res, next) => {

    var text = req.params.text;
    var regex = new RegExp(text, 'i');

    searchHospitals(text, regex)
    .then(hospitals => {

        res.status(200).json({
            ok: true,
            hospitals: hospitals
        });
    })
    .catch((message, err) => {

        res.status(500).json({
            ok: false,
            message: message,
            errors: err
        });
    });
});

//========================================
// Search doctors
//========================================
app.get('/doctors/:text', (req, res, next) => {

    var text = req.params.text;
    var regex = new RegExp(text, 'i');

    searchDoctors(text, regex)
    .then(doctors => {

        res.status(200).json({
            ok: true,
            doctors: doctors
        });
    })
    .catch((message, err) => {

        res.status(500).json({
            ok: false,
            message: message,
            errors: err
        });
    });
});

//========================================
// Search all
//========================================
app.get('/all/:text', (req, res, next) => {

    var text = req.params.text;
    var regex = new RegExp(text, 'i');

    Promise.all([
        searchUsers(text, regex),
        searchHospitals(text, regex),
        searchDoctors(text, regex)
    ])
    .then(result => {

        return res.status(200).json({
            ok: true,
            users: result[0],
            hospitals: result[1],
            doctors: result[2]
        });
    })
    .catch((message, err) => {

        return res.status(500).json({
            ok: false,
            message: message,
            errors: err
        });
    })
});

function searchUsers(text, regex){

    return new Promise( (resolve, reject) => {

        User.find({}, 'name email role google')
        .or( { name: regex }, { email: regex })
        .exec((err, users) => {

            if(err){

                reject('Fail to get users', err);

            } else {

                resolve(users);
            }
    
        });
    });
}

function searchHospitals(text, regex){

    return new Promise( (resolve, reject) => {

        Hospital.find({ name: regex })
        .populate('user', 'name email')
        .exec((err, hospitals) => {

            if(err){

                reject('Fail to get hospitals', err);

            } else {

                resolve(hospitals);
            }
    
        });
    });
}

function searchDoctors(text, regex){

    return new Promise( (resolve, reject) => {

        Doctor.find({ name: regex })
        .populate('user', 'name email')
        .populate('hospital', 'name')
        .exec((err, doctors) => {

            if(err){

                reject('Fail to get doctors', err);

            } else {

                resolve(doctors);
            }
    
        });
    });
}

module.exports = app;