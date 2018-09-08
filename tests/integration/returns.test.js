
const request = require('supertest'); 
const moment = require('moment');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');

describe('/api/returns', () => {

    let server, customerId, movieId, rental, token, movie;

    beforeEach(async() => {
        // start the server
        server = require('../../index');
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User({ isAdmin: true}).generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345' },
            numberInStock: 10 
        });

        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            }, 
            movie:  {
                _id: movieId,
                title: '123456',
                dailyRentalRate: 2
            }
        });

        await rental.save();
    })

    afterEach(async() => {
        // clear the rentals
        await Rental.remove({});
        await Movie.remove({});

        // stop the server
        await server.close();
    });

    // it('should work', async () => {
    //     const res = await Rental.findById(rental._id);
    //     //expect(res.body).toHaveProperty('_id');
    //     expect(res).not.toBeNull();
    // });

    describe('POST /', async () => {

        // Mosh's Technique
        const exec = async () => {
            return request(server)
                .post('/api/returns')
                .set('x-auth-token', token)
                .send({ customerId, movieId }); 
        }

        it('should return a status 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);

        });

        it('should return a status of 400 if customer id is not provided', async () => {
            customerId = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return a status of 400 if movie id is not provided', async () => {
            movieId = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return a status of 404 if no rental is found for the customer/movie id', async () => {
            await Rental.remove({});

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return a status of 400 if the rental has already been processed aka already has a returnDate', async () => {
            rental.dateReturned = new Date();
            await rental.save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return a status of 200 if the return is valid', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should set the returnDate if input is valid', async () => {
            const res = await exec();

            const rentalInDb = await Rental.findById(rental._id);
            //console.log("Rental in DB: ", rentalInDb);
            const diff = new Date() - rentalInDb.dateReturned;

            //expect(rentalInDb).toBeDefined();
            expect(diff).toBeLessThan(10 * 1000);
           
        });

        it('should calculate the rental fee', async () => {
            // set dateOut manually to 7 days ago, other price will be a few seconds 
            // expect fee to be dailyRentalRate * 7
            rental.dateOut = moment().add(-7, 'days').toDate();
            await rental.save();

            const res = await exec();

            const rentalInDb = await Rental.findById(rental._id);
            //console.log("Rental: ", rentalInDb);

            //expect(rentalInDb.rentalFee).toBeDefined();
            expect(rentalInDb.rentalFee).toBe(14);
        });

        it('should increase the movie stock if the request is valid', async () => {
            const res = await exec();
            
            const movieInDb = await Movie.findById(movieId);
            

            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
        });

        it('should return the rental in the body of the response', async () => {
            const res = await exec();

            const rentalInDb = await Rental.findById(rental._id);

            //expect(res.body).toMatchObject(rentalInDb);
            // expect(res.body).toHaveProperty('dateOut');
            // expect(res.body).toHaveProperty('rentalFee');
            // expect(res.body).toHaveProperty('dateReturned');
            // expect(res.body).toHaveProperty('customer');
            // expect(res.body).toHaveProperty('movie');

            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'])
            );
        });
    });
});