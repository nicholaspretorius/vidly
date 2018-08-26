const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const { Customer, validateCustomer } = require('../models/customer');
const router = express.Router();
const not_found = { "not_found": "Customer ID not found." };







router.get('/', async (req, res) => {
    const result = await Customer.find();
    res.send(result);
});

router.get('/:id', async (req, res) => {
    let result;
    try {
        result = await Customer.findById(req.params.id);
    } catch (ex) {
        result = ex;
    }

    if(!result) return res.status(404).send(not_found);

    res.send(result);
});

router.post('/', async (req, res) => {
    const { error } = validateCustomer(req.body);

    if(error) return res.status(400).send(error); 

    let customer = new Customer({
        name: req.body.name,
        mobile: req.body.mobile
    });
    customer = await customer.save();
    
    res.status(201).send(customer);
});

router.put('/:id', async (req, res) => {

    const { error } = validateCustomer(req.body);

    if(error) return res.status(400).send(error); 

    let result; 
    let customer = {
        name: req.body.name,
        mobile: req.body.mobile
    };

    try {
        result = await Customer.findByIdAndUpdate(req.params.id, customer, { new: true });
    } catch (ex) {
        result = ex;
    }

    if(!result) return res.status(404).send(not_found);

    res.send(result);
});

router.delete('/:id', async (req, res) => {
    
    const result = await Customer.findByIdAndRemove(req.params.id);

    if(!result) res.status(404).send(not_found);
    
    res.status(201).send(result);
});

module.exports = router;

