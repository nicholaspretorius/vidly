const express = require('express');
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const router = express.Router();

function validateLogin(req) {
    const schema = {
        email: Joi.string().email().min(5).max(255).required(),
        password: Joi.string().valid(req.password).required()
    }

    return Joi.validate(req, schema);
}

router.post('/', async (req, res) => {
    const { error } = validateLogin(req.body);

    if (error) res.status(400).send(error);

    try {
        let user = await User.findOne({ email: req.body.email });
    
        if (!user) return res.status(400).send({ 'message':'Invalid email or password' });
    
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        
        if (!validPassword) return res.status(400).send({ 'message': 'Invalid email or password' });
        
        //const token = jwt.sign({ _id: user._id }, config.get('jwtPrivateKey'));
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send({ 'message': 'success' });



    } catch (ex) {
        res.status(400).send(ex);
    }
});

module.exports = router;