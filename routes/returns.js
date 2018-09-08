const express = require('express');
const router = express.Router();
const moment = require('moment');
const { Rental, validateRental } = require('../models/rental');
const { Movie } = require('../models/movie');
const validateObjectId = require('../middleware/validateObjectId');
const { Customer } = require('../models/customer');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/', [auth, validate(validateRental)], async (req, res) => {
    
    // Static: Rental.lookup
    // Instance: new User().generateAuthToken();

    // const { error } = validateRental(req.body)
    // if (error) return res.status(400).send(error);

    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    
    // const rental = await Rental.findOne({
    //     'customer._id': req.body.customerId,
    //     'movie._id': req.body.movieId,
    // });

    if(!rental) return res.status(404).send('Rental with the supplied customer id not found.');

    if(rental.dateReturned) return res.status(400).send('Rental already processed.');

    rental.dateReturned = new Date(); //1;

    rental.return();
    
    await rental.save();
    
    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });

    //rental.rentalFee = Math.floor(fee);
    //rental.rentalFee = 1;
    
    res.send(rental);
});

module.exports = router;