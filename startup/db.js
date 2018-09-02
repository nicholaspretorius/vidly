const mongoose = require('mongoose');
const config = require('config');
const winston = require('winston');

module.exports = function() {
    const db = config.get('dbUrl');
    mongoose.connect(db)
    .then(() => winston.info(`Connected to ${db}...`))
    // .catch(err => {
    //     console.error('Could not connect to MongoDB due to error: ', err)
    //     winston.error(err.message, err);
    //     next(err);
    // });
}