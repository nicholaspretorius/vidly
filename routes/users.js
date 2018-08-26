const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User, validateUser } = require('../models/user');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const result = await User.find().select(['name', 'email']);
        res.send(result);
    } catch (ex) {
        res.status(400).send(ex);
    }
});

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);

    if (error) res.status(400).send(error);

    let user = await User.findOne({ email: req.body.email });

    if (user) return res.status(400).send({ 'message':'User already exists' });

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    // salting and hashing password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    try {
        await user.save();
        const token = user.generateAuthToken();
        user = _.pick(user, ['_id', 'name', 'email']);
        res.header('x-auth-token', token).status(201).send(user);
    } catch (ex) {
        res.status(400).send(ex);
    }
});

module.exports = router;