const mongoose = require('mongoose');
const moment = require('moment');
const Joi = require('joi');
const {
  Movie,
  movie_schema
} = require('./movie');
const {
  Customer,
  customer_schema
} = require('./customer');

const schema = mongoose.Schema({
  // customerId: { type: customer_schema, required: true },
  // movieId: { type: movie_schema, required: true },
  // rentalDate: { type: Date, default: Date.now() },
  // returnDate: { type: Date, default: Date.now() },
  // dateReturned: { type: Date },
  // rentalFee: { type: Number, min: 0 }
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      },
      isGold: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      }
    }),
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
      },
      numberInStock: {
        type: Number,
        default: 1,
        max: 5
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

schema.statics.lookup = function(customerId, movieId) {
  return this.findOne({
    'customer._id': customerId,
    'movie._id': movieId,
  });
};

schema.methods.return = function() {

  this.dateReturned = new Date(); //1;
  
  // calculate rental fee 
  const rentalDays = moment().diff(this.dateOut, 'days');
  //const fee = ((rental.dateReturned - rental.dateOut) / (24 * 60 * 60 * 1000))  * rental.movie.dailyRentalRate; //rental.dateOut; ///(24 * 60 * 60 * 1000) * rental.movieId.dailyRentalRate);
  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};

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