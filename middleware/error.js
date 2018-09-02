const winston = require('winston');

module.exports = function(err, req, res, next) {
    // log the exception
    console.error("Error Middleware: ", err);
    winston.error(err.message, err);
    res.status(500).send(err);
}