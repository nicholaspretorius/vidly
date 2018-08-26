const mongoose = require('mongoose');
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');
const Joi = require('joi');
const config = require('config');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const app = express();

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL Error: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect(config.get('dbUrl'))
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB due to err', err));

app.use(express.json());
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/login', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));