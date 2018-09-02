
const mongoose = require('mongoose');
const { Rental } = require('../../models/rental');

xdescribe('/api/returns', () => {

    beforeEach(async() => {
        // start the server
        server = require('../../index');

        const rental = new Rental({
            customerId
        });
    })

    afterEach(async() => {
        // stop the server
        server.close();
    });

    describe('POST /', () => {

        it('should return a status 401 if client is not logged in', () => {
    
        });
    });
});