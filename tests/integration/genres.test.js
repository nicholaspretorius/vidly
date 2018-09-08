
const request = require('supertest'); 
const mongoose = require('mongoose');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
let server;

describe('/api/genres', () => {

    beforeEach(async() => {
        // start the server
        server = require('../../index');
    })

    afterEach(async() => {
        // remove all fake genres
        await Genre.remove({});

        // stop the server
        await server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async () => {

            // add fake genres
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(genre => genre.name === 'genre1')).toBeTruthy();
            expect(res.body.some(genre => genre.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {

        it('should return a 404 status if invalid id is passed', async () => {
            const res = await request(server).get('/api/genres/1');
            expect(res.status).toBe(404);
        });

        it('should return a 404 status if genre not found', async () => {
            
            const fake_id = mongoose.Types.ObjectId();

            const res = await request(server).get('/api/genres/' + fake_id);
            //const res = await request(server).get('/api/genres/3');
            expect(res.status).toBe(404);
        });

        it('should return a single genre if valid id is passed', async () => {
            
            let genre = new Genre({ name: 'genre1' });
            genre = await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);
            expect(res.status).toBe(200);
            // expect(res.body.length).toBe(1);
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('DELETE /:id', () => {

        let token, id, genre;

        // Mosh's Technique
        const exec = async () => {
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token)
                .send(); 
        }

        beforeEach(async () => {
            genre = new Genre({ name: 'genre1' });
            genre = await genre.save();
            id = genre._id;
            token = new User({ isAdmin: true }).generateAuthToken();
        });

        it('should return a 401 if client is not logged in', async () => {
            token = '';

            const res = await exec(); 

            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken(); 
      
            const res = await exec();
      
            expect(res.status).toBe(403);
        });

        it('should return a 404 status if an invalid id is passed', async () => {
            id = 1;
            const res = await exec(); 
            expect(res.status).toBe(404);
        });

        it('should return a 404 status if a valid genre is not found', async () => {
            
            id = mongoose.Types.ObjectId();

            const res = await exec(); 
            expect(res.status).toBe(404);
        });

        it('should delete the genre if input is valid', async () => {
            const res = await exec(); 

            const genreNotFound = await Genre.findById(id);

            expect(genreNotFound).toBeNull();
            expect(res.status).toBe(200);
        });

        it('should return the removed genre', async () => {
            const res = await exec();
      
            expect(res.body).toHaveProperty('_id', genre._id.toHexString());
            expect(res.body).toHaveProperty('name', genre.name);
        });
    });

    describe('POST /', () => {

        let token, name;

        // Mosh's Technique
        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: name }); 
        }

        beforeEach(() => {
            token = new User({ isAdmin: true }).generateAuthToken();
            name = 'genre1';
        });

        it('should return a 401 if client is not logged in', async () => {
            token = '';

            const res = await exec(); 

            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken(); 
      
            const res = await exec();
      
            expect(res.status).toBe(403);
        });

        it('should return a 400 if genre is less than 5 chars', async () => {
            name = '123';

            const res = await exec(); 

            expect(res.status).toBe(400);
        });

        it('should return a 400 if genre is more than 50 chars', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {
            const res = await exec();

            const genre = await Genre.find({ name: 'genre1' });

            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('PUT /:id', () => {
        let token; 
        let newName; 
        let genre; 
        let id; 
    
        const exec = async () => {
          return await request(server)
            .put('/api/genres/' + id)
            .set('x-auth-token', token)
            .send({ name: newName });
        }
    
        beforeEach(async () => {
          // Before each test we need to create a genre and 
          // put it in the database.      
          genre = new Genre({ name: 'genre1' });
          await genre.save();
          
          token = new User({ isAdmin: true }).generateAuthToken();     
          id = genre._id; 
          newName = 'updatedName'; 
        })
    
        it('should return 401 if client is not logged in', async () => {
          token = ''; 
    
          const res = await exec();
    
          expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken(); 
      
            const res = await exec();
      
            expect(res.status).toBe(403);
        });
    
        it('should return 400 if genre is less than 5 characters', async () => {
          newName = '1234'; 
          
          const res = await exec();
    
          expect(res.status).toBe(400);
        });
    
        it('should return 400 if genre is more than 50 characters', async () => {
          newName = new Array(52).join('a');
    
          const res = await exec();
    
          expect(res.status).toBe(400);
        });
    
        it('should return 404 if id is invalid', async () => {
          id = 1;
    
          const res = await exec();
    
          expect(res.status).toBe(404);
        });
    
        it('should return 404 if genre with the given id was not found', async () => {
          id = mongoose.Types.ObjectId();
    
          const res = await exec();
    
          expect(res.status).toBe(404);
        });
    
        it('should update the genre if input is valid', async () => {
          await exec();
    
          const updatedGenre = await Genre.findById(genre._id);
    
          expect(updatedGenre.name).toBe(newName);
        });
    
        it('should return the updated genre if it is valid', async () => {
          const res = await exec();
    
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('name', newName);
        });
    });  
});