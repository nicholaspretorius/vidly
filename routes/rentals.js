const express = require('express');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const Joi = require('joi');
const { Rental, validateRental } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const router = express.Router();
const rental_not_found = { "not_found": "Rental ID not found." };
const movie_not_found = { "not_found": "Movie ID not found." };
const customer_not_found = { "not_found": "Customer ID not found." };
const auth = require('../middleware/auth');

Fawn.init(mongoose);

router.get('/', auth, async (req, res) => {
    try {
        const result = await Rental.find().sort('-dateOut');

        if(!result) return res.status(401).send(rental_not_found);

        res.send(result);

    } catch(ex) {
        res.status(400).send(ex);
    }
});

router.post('/', auth, async (req, res) => {
    const { error } = validateRental(req.body);

    if(error) res.status(400).send(error);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send(customer_not_found);
    
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send(movie_not_found);

    if (movie.numberInStock === 0) return res.status(400).send('Movie is not currently available.');

    let rental = new Rental({
        customerId: {
            _id: customer._id,
            name: customer.name,
            mobile: customer.mobile
        },
        movieId: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run();

        res.status(201).send(rental);
    } catch(ex) {
        res.status(500).send(ex.errors);
    }
});

module.exports = router;
