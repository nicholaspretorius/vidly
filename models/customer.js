const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: Number , required: true },
    isGold: { type: Boolean, default: false }
});

const Customer = mongoose.model('Customer', schema);

function validateCustomer(customer) {
    
    const validation_schema = {
        name: Joi.string().required().min(2),
        mobile: Joi.number().required(),
        isGold: Joi.boolean()
    }

    return Joi.validate(customer, validation_schema);
}

module.exports = {
    customer_schema: schema,
    validateCustomer: validateCustomer,
    Customer: Customer
};