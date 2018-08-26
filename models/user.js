const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');

const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(.{8,24})/;

const schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    }, 
    email: {
        type: String, 
        required: true, 
        trim: true, 
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String, 
        required: true, 
        trim: true,
        minlength: 8, 
        maxlength: 24,
        validate: {
            validator: function(value) {
                return value.match(password_regex);
            }
        }
    }
});

schema.plugin(uniqueValidator);

const User = mongoose.model('Users', schema);

function validateUser(user) {
    const schema = {
        name: Joi.string().min(5).max(255).required(),
        email: Joi.string().email().min(5).max(255).required(),
        password: Joi.string().valid(user.password).required()
    }

    return Joi.validate(user, schema);
}

module.exports = {
    validateUser: validateUser,
    User: User
}