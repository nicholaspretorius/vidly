const mongoose = require('mongoose');
const express = require('express');
const { User, validateUser } = require('../models/user');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await User.find().select(['name', 'email']);
        res.send(result);
    } catch (ex) {
        res.status(400).send(ex);
    }
});

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);

    if (error) res.status(400).send(error);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    try {
        await user.save();
        res.status(201).send(user);
    } catch (ex) {
        res.status(400).send(ex);
    }
});

module.exports = router;