var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var Schema = mongoose.Schema;

var roles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not valid role'
};

var userSchema = new Schema({
    
    name: { type: String, required: [true, 'This field is required'] },
    email: {type: String, unique: true, required: [true, 'This filed is required']},
    password: {type: String, required: [true, 'This field is required']},
    img: {type: String},
    role: {type: String, default: 'USER_ROLE', enum: roles}
});

userSchema.plugin( uniqueValidator, { message: '{PATH} must be unique' });

module.exports = mongoose.model('User', userSchema);