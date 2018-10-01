var express = require('express');

var fs = require('fs');

var fileUpload = require('express-fileupload');

var User = require('../modules/user');
var Hospital = require('../modules/hospital');
var Doctor = require('../modules/doctor');

var app = express();

app.use(fileUpload());

//========================================
// Upload file
//========================================
app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // validate type
    var validTypes = ['users', 'hospitals', 'doctors'];
    if(!isValidType(type, validTypes)){
        return res.status(400).json({
            ok: false,
            message: 'Invalid type. Types allowed: ' + validTypes.join(', ')
        });
    }    

    // validate if the request has an image
    if (!req.files){
        return res.status(400).json({
            ok: false,
            message: 'No file was uploaded'
        });
    }

    // validate file extension
    var validExtensions = ['png', 'jpg', 'jpeg', 'gif'];
    if(!isValidFileExtension(req, validExtensions)){
        return res.status(400).json({
            ok: false,
            message: 'Invalid file extension. Extensions allowed: ' + validExtensions.join(', ')
        });
    }

    uploadAndUpdateImage(type, id, req, res);

});

function isValidType(type, validTypes){

    if(validTypes.indexOf(type) < 0){
        return false;
    }
    return true;
}

function isValidFileExtension(req, validExtensions){

    var file = req.files.img;
    var filenameSplit = file.name.split('.');
    var fileExtension = filenameSplit[filenameSplit.length - 1];

    if(validExtensions.indexOf(fileExtension) < 0){
        return false;
    }
    return true;
}

function uploadFile(entity, type, id, req, res){

    var file = req.files.img;
    var filenameSplit = file.name.split('.');
    var fileExtension = filenameSplit[filenameSplit.length - 1];

    var finalFilename = `${id}-${new Date().getTime()}.${fileExtension}`;

    var path = `./uploads/${type}/${finalFilename}`;

    file.mv(path, err => {

        if(err){

            return res.status(500).json({
                ok: false,
                message: 'Fail to upload file',
                errors: err
            });
        }

        entity.img = finalFilename;

        entity.save((err, entityUpdated) => {

            if(err){
    
                return res.status(500).json({
                    ok: false,
                    message: "Fail to update image",
                    errors: err
                });
            }
    
            return res.status(200).json({
                ok: true,
                message: "File upload successfully",
                [type]: entityUpdated
            });
        });
    });
}

function uploadAndUpdateImage(type, id, req, res){

    if(type == 'users'){

        validateUser(id)
        .then( user => {
            
            removeCurrentImage(type, user.img);
            uploadFile(user, type, id, req, res);
            
        })
        .catch(result => {

            console.log(`${result.message}, ${result.err}, ${result.code}`);
 
            return res.status(result.code).json({
                ok: false,
                message: result.message,
                errors: result.err
            });
        });

    } else if (type == 'hospitals'){

        validateHospital(id)
        .then( hospital => {

            removeCurrentImage(type, hospital.img);
            uploadFile(hospital, type, id, req, res);
            
        })
        .catch(result => {

            console.log(`${result.message}, ${result.err}, ${result.code}`);
 
            return res.status(result.code).json({
                ok: false,
                message: result.message,
                errors: result.err
            });
        });

    } else {
        // doctors by default, because the type was previously validated
        validateDoctor(id)
        .then( doctor => {

            removeCurrentImage(type, doctor.img);
            uploadFile(doctor, type, id, req, res);
            
        })
        .catch(result => {

            console.log(`${result.message}, ${result.err}, ${result.code}`);
 
            return res.status(result.code).json({
                ok: false,
                message: result.message,
                errors: result.err
            });
        });
    }
}


function removeCurrentImage(type, image){

    if(image){

        var currentFilename = `./uploads/${type}/${image}`;

        if(fs.existsSync(currentFilename)){
            fs.unlinkSync(currentFilename);
        }
    }
}


function validateUser(id){

    return new Promise((resolve, reject) => {

        User.findById(id, (err, user) => {

            if(err){

                return reject({message: 'Fail to get user', err: err, code: 500});
            } 
            
            if (!user){

                return reject({message: 'User does not exist', err: 'User does not exist', code: 400});
            } 
            
            resolve(user);
        });
    });
}

function validateHospital(id){

    return new Promise((resolve, reject) => {

        Hospital.findById(id, (err, hospital) => {

            if(err){

                return reject({message: 'Fail to get hospital', err: err, code: 500});
            } 
            
            if (!hospital){

                return reject({message: 'Hospital does not exist', err: 'Hospital does not exist', code: 400});
            } 
            
            resolve(hospital);
        });
    });
}

function validateDoctor(id){

    return new Promise((resolve, reject) => {

        Doctor.findById(id, (err, doctor) => {

            if(err){

                return reject({message: 'Fail to get doctor', err: err, code: 500});
            } 
            
            if (!doctor){

                return reject({message: 'Doctor does not exist', err: 'Doctor does not exist', code: 400});
            } 
            
            resolve(doctor);
        });
    });
}

module.exports = app;