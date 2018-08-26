const mongoose = require('mongoose');
const Joi = require('joi');
const { Movie, movie_schema } = require('./movie');
const { Customer, customer_schema } = require('./customer');

const schema = mongoose.Schema({
    customerId: { type: customer_schema, required: true },
    movieId: { type: movie_schema, required: true },
    rentalDate: { type: Date, default: Date.now() },
    returnDate: { type: Date, default: Date.now() },
    dateReturned: { type: Date },
    rentalFee: { type: Number, min: 0 }
});

const Rental = mongoose.model('Rentals', schema);

function validateRental(rental) {
    const validation_schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    }

    // if (!mongoose.Types.ObjectId.isValid(req.body.customerId)) return res.status(400).send('Customer Id is not a valid customer id.');
    // if (!mongoose.Types.ObjectId.isValid(req.body.movieId)) return res.status(400).send('Movie id is not a valid movie id.');

    return Joi.validate(rental, validation_schema);
}

module.exports = {
    rental_schema: schema,
    validateRental: validateRental,
    Rental: Rental
}