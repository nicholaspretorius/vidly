const express = require('express');
const router = express.Router();
const { Genre, validate_genre } = require('../models/genre');
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncMiddleware = require('../middleware/async');

//const Genre = mongoose.model('Genre', genre.schema);

router.get('/', async (req, res) => {
  //throw new Error('Fake error');
  const result = await Genre.find().sort('name');
  res.send(result);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate_genre(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let result = new Genre({ name: req.body.name });
  result = await result.save();
  
  res.send(result);
});

router.put('/:id', validateObjectId, [auth, admin], async (req, res) => {
  const { error } = validate_genre(req.body); 

  if (error) return res.status(400).send(error.details[0].message);

  const result = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

  if (!result) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(result);
});

router.delete('/:id', validateObjectId, [auth, admin], async (req, res) => {
  const result = await Genre.findByIdAndRemove(req.params.id);

  if (!result) return res.status(404).send('The genre with the given ID was not found.');

  res.send(result);
});

router.get('/:id', validateObjectId, async (req, res) => {

  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

module.exports = router;