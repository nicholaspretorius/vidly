const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {Genre, validate_genre, genre_schema} = require('../models/genre');

//const Genre = mongoose.model('Genre', genre.schema);

router.get('/', async (req, res) => {
  const result = await Genre.find().sort('name');
  res.send(result);
});

router.post('/', async (req, res) => {
  const { error } = validate_genre(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let result = new Genre({ name: req.body.name });
  result = await result.save();
  
  res.send(result);
});

router.put('/:id', async (req, res) => {
  const { error } = validate_genre(req.body); 

  if (error) return res.status(400).send(error.details[0].message);

  const result = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

  if (!result) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(result);
});

router.delete('/:id', async (req, res) => {
  const result = await Genre.findByIdAndRemove(req.params.id);

  if (!result) return res.status(404).send('The genre with the given ID was not found.');

  res.send(result);
});

router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

module.exports = router;