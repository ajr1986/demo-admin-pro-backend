var express = require('express');

var config = require('../config/config');

var mwAuthentication = require('../middleware/authentication');

var app = express();

var Doctor = require('../modules/doctor');

//========================================
// Get doctors
//========================================
app.get('/', (req, res, next) => {

    var p = req.query.p || 0;
    p = p * config.PAGE_SIZE;

    var total = 0;

    Doctor.count().exec((err, qty) => {

        if(err){
            return res.status(500).json({
                ok: false,
                message: 'Fail to count doctors',
                errors: err
            });
        }

        total = qty;
    });

    Doctor.find()
    .skip(p)
    .limit(config.PAGE_SIZE)
    .populate('user', 'name email')
    .populate('hospital')
    .exec((err, doctors) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to get doctors',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            doctors: doctors,
            total: total
        });
    });
});

//========================================
// Get doctor
//========================================
app.get('/:id', (req, res, next) => {

    var id = req.params.id;

    Doctor.findById(id)
    .populate('user', 'name email')
    .populate('hospital')
    .exec((err, doctor) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to get doctors',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            doctor: doctor
        });
    });
});

//========================================
// Post doctor
//========================================
app.post('/', mwAuthentication.tokenValidation, (req, res, next) => {

    var doctor = new Doctor({
        name: req.body.name,
        img: req.body.img,
        user: req.user._id,
        hospital: req.body.hospital
    });

    doctor.save((err, doctorPersisted) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to create doctor',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            doctor: doctorPersisted
        });
    });
});

//========================================
// Put doctor
//========================================
app.put('/:id', mwAuthentication.tokenValidation, (req, res, next) => {

    var id = req.params.id;

    var doctor = {
        name: req.body.name,
        img: req.body.img,
        user: req.user._id,
        hospital: req.body.hospital
    };

    Doctor.findByIdAndUpdate(id, doctor, {new: true}, (err, doctorUpdated) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to update doctor',
                errors: err
            });
        }

        if(!doctorUpdated){

            return res.status(400).json({
                ok: false,
                message: 'Doctor does not exist'
            });
        }

        res.status(200).json({
            ok: true,
            doctor: doctorUpdated
        });
    });
});

//========================================
// Delete doctor
//========================================
app.delete('/:id', mwAuthentication.tokenValidation, (req, res, next) => {

    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, doctorDeleted) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to delete doctor',
                errors: err
            });
        }

        if(!doctorDeleted){

            return res.status(400).json({
                ok: false,
                message: 'Doctor does not exist'
            });
        }

        res.status(200).json({
            ok: true,
            doctor: doctorDeleted
        });
    });
});

module.exports = app;