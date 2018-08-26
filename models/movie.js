const mongoose = require('mongoose');
const { genre_schema } = require('./genre');
const Joi = require('joi');

const schema = mongoose.Schema({
    title: {
        type: String, 
        required: true,
        trim: true,
        minlenth: 2,
        maxlength: 255
    }, 
    genre: {
        type: genre_schema,
        require: true,
        trim: true
    },
    numberInStock: {
        type: Number,
        min: 0,
        max: 99,
        default: 0
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 1,
        max: 99
    }
});

const Movie = mongoose.model('Movies', schema);

function validateMovie(movie) {
    const schema = {
        title: Joi.string().min(2).max(255).required(),
        genre: Joi.objectId().required(),
        numberInStock: Joi.number().min(0).max(99),
        dailyRentalRate: Joi.number().min(1).max(99).positive().precision(2).required()
    }

    return Joi.validate(movie, schema);
}

module.exports = {
    movie_schema: schema,
    validate_movie: validateMovie,
    Movie: Movie
}