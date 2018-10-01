var express = require('express');

var config = require('../config/config')

var mwAuthentication = require('../middleware/authentication');

var app = express();

var Hospital = require('../modules/hospital');

//========================================
// Get hospitals
//========================================
app.get('/', (req, res, next) => {

    var p = req.query.p || 0;
    p = p * config.PAGE_SIZE;

    var total = 0;

    Hospital.count().exec((err, qty) => {

        if(err){
            return res.status(500).json({
                ok: false,
                message: 'Fail to count hospitals',
                errors: err
            });
        }

        total = qty;
    });

    Hospital.find()
    .skip(p)
    .limit(config.PAGE_SIZE)
    .populate('user', 'name email')
    .exec( (err, hospitals) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to get hospitals',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospitals: hospitals,
            total: total
        });
    });
});

//========================================
// Post hospital
//========================================
app.post('/', mwAuthentication.tokenValidation, (req, res, next) => {

    var hospital = new Hospital({

        name: req.body.name,
        img: req.body.img,
        user: req.user._id
    });

    hospital.save((err, hospitalPersisted) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to create hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospitals: hospitalPersisted
        });
    });
});

//========================================
// Put hospital
//========================================
app.put('/:id', mwAuthentication.tokenValidation, (req, res, next) => {

    var id = req.params.id;

    var hospital = {
        name: req.body.name,
        img: req.body.img,
        user: req.user._id
    };

    Hospital.findByIdAndUpdate(id, hospital, {new: true}, (err, hospitalUpdated) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to update hospital',
                errors: err
            });
        }

        if(!hospitalUpdated){

            return res.status(400).json({
                ok: false,
                message: 'Hospital does not exist'
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalUpdated
        });
    });
});

//========================================
// Delete hospital
//========================================
app.delete('/:id', mwAuthentication.tokenValidation, (req, res, next) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to delete hospital',
                errors: err
            });
        }

        if(!hospitalDeleted){

            return res.status(400).json({
                ok: false,
                message: 'Hospital does not exist'
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalDeleted
        });
    });
});

module.exports = app;