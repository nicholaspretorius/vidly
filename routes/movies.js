const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const { validate_movie, Movie } = require('../models/movie');
const { Genre } = require('../models/genre');
const auth = require('../middleware/auth');
const router = express.Router();
const not_found = { "not_found": "Movie ID not found." };

router.get('/', async (req, res) => {
    try {
        const result = await Movie.find().sort('title');

        if(!result) return res.status(401).send(not_found);

        res.send(result);

    } catch(ex) {
        res.status(400).send(ex.errors);
    }
});

router.post('/', auth, async (req, res) => {
    const { error } = validate_movie(req.body);

    if(error) res.status(400).send(error);

    const genre = await Genre.findById(req.body.genre);
    if (!genre) return res.status(400).send(not_found);

    let movie = new Movie({
        title: req.body.title,
        genre: { 
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    try {
        movie = await movie.save()
        res.status(201).send(movie);
    } catch(ex) {
        res.status(400).send(ex.errors);
    }
});

router.get('/:id', async (req, res) => {
    let result;
    try {
        result = await Movie.findById(req.params.id);
    } catch (ex) {
        result = ex;
    }

    if(!result) return res.status(404).send(not_found);

    res.send(result);
});

router.put('/:id', async (req, res) => {

    const { error } = validate_movie(req.body);

    if(error) return res.status(400).send(error); 

    // let movie = new Movie({
    //     title: req.body.title,
    //     numberInStock: req.body.numberInStock,
    //     genre: req.body.genre,
    //     dailyRentalRate: req.body.dailyRentalRate
    // });

    try {
        const result = await Movie.findById(req.params.id);
        
        if(!result) return res.status(404).send(not_found);
        
        result.genre.name = req.body.genre;
        result.title = req.body.title;
        result.numberInStock = req.body.numberInStock;
        result.dailyRentalRate = req.body.dailyRentalRate;
        result.save();
        res.status(201).send(result);
    } catch (ex) {
        res.status(400).send(ex);
    } 
});

router.delete('/:id', auth, async (req, res) => {
    
    const result = await Movie.findByIdAndRemove(req.params.id);

    if(!result) res.status(404).send(not_found);
    
    res.send(result);
});

module.exports = router;