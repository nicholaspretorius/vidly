require('express-async-errors');
const config = require('config');
const winston = require('winston');
//require('winston-mongodb');

module.exports = function () {
    // process.on('uncaughtException', (ex) => {
    //   winston.error(ex.message, ex);
    //   prcoess.exit(1);
    // });

    winston.handleExceptions(
        new winston.transports.Console({ colorize: true, prettyPrint: true}),
        new winston.transports.File({
            filename: 'exceptions.log'
        })
    );

    process.on('unhandledRejection', (ex) => {
        // winston.error(ex.message, ex);
        // process.exit(1);
        throw ex;
    });

    winston.add(winston.transports.File, {
        filename: 'errors.log'
    });
    // winston.add(winston.transports.MongoDB, {
    //     db: config.get('dbUrl'),
    //     level: 'error'
    // });

    // throw new Error('Failure during startup');
}