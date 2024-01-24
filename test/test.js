const request = require('supertest');
const assert = require('assert');
const app = require('../index');
const query = require('../db/pool');
const {getEnvelope, createEnvelope, deleteEnvelope, updateEnvelope, tranferEnvelope} = require('../db/queries');

const expectedEnvelopeStructure = {
  id: String,
  title: String,
  budget: Number,
  user_id: String
};

describe('Personal Budget II', () => {
    describe('/getEnvelopes', () => {
        it('should return status 200 and the envelopes data', (done) => {
          // Setup
         
          // Validation + Excersie
          request(app)
            .get('/getEnvelopes')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              assert.ok(Array.isArray(res.body), 'Expected response body to be an array');
              res.body.forEach(envelope => {
                assert.deepEqual(Object.keys(envelope).sort(), Object.keys(expectedEnvelopeStructure).sort(), 'Envelope has the correct structure');
              });
              done();
            });
        });
    });

    describe('/getEnvelope/:id', () => {
      it('should return the envelope with matching id', (done) => {
        // Set up
        const envelopeId = '002';
        // Validation + Exercise
        request(app)
          .get(`/getEnvelope/${envelopeId}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            assert.ok(res.body[0].id === envelopeId);
            assert.deepEqual(Object.keys(res.body[0]).sort(), Object.keys(expectedEnvelopeStructure).sort(), 'Envelope has the correct structure');
            done();
          });
      });
      it('should return status 404 if there is no envelope with matching id', (done) => {
         // Set up
         const envelopeId = '000';
         // Validation + Exercise
         request(app)
          .get(`/getEnvelope/${envelopeId}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });
    });

    describe('/createEnvelope', () => {
      let createdEnvelopeId;
      it('should create the envelope in the database', (done) => {
        // Set up
        const body = {"id": "004", "title": "Clothes", "budget": 10000, "user_id": "001"};
        // Validation + Exercise
        request(app)
          .post('/createEnvelope')
          .send(body)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            assert.deepStrictEqual(res.body, body);
            createdEnvelopeId = res.body.id;
            done();
          });
      });

      it('should return error if the request body is invalid', (done) => {
        // Set up
        const invalidBody = {"id": "0004", "title": "Games", "user_id": "001"};
        // Validation + Exercise
        request(app)
          .post('/createEnvelope')
          .send(invalidBody)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      it('should return error if there is duplicate data', (done) => {
        // Set up
        const duplicateBody = {"id": "001", "title": "Toys", "budget": 10000, "user_id": "001"};
        // Validation + Exercise
        request(app)
          .post('/createEnvelope')
          .send(duplicateBody)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(409)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      // Clean Up
      after(async () => {
        if (createdEnvelopeId) {
          try {
            // Perform a delete operation in the database using the createdEnvelopeId
            await deleteEnvelope(createdEnvelopeId);
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        }
      });
    });

    describe('/updateEnvelope/:id', () => {
      let preUpdateBody;
      const updatingEnvelopeId = '002';

      it('should edit envelope with matching id with the provided data', async () => {
        // Setup
        const body = {"title": "Furnitures", "budget": 10000, "user_id": "001"};
        preUpdateBody = await getEnvelope(updatingEnvelopeId);

        // Validation + Exercise
        request(app)
          .put(`/updateEnvelope/${updatingEnvelopeId}`)
          .send(body)
          .expect(200)
          .end( async (err, res) => {
            if (err) return done(err);
            // Check the envelope has updated
            const updatedEnvelope = await getEnvelope(updatingEnvelopeId)
            const results = updatedEnvelope[0];
            const bodyJs = JSON.parse(body);
            assert.deepStrictEqual(results.title, bodyJs.title);
            assert.deepStrictEqual(results.budget, bodyJs.budget);
            assert.deepStrictEqual(results.user_id, bodyJs.user_id);
            done();
          });
      });

      it('should return error if there is duplicate data', (done) => {
        // Set up
        const dupBody = {"title": "Games", "budget": 10000, "user_id": "001"};
        // Validation + Exercise
        request(app)
          .put(`/updateEnvelope/${updatingEnvelopeId}`)
          .send(dupBody)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(409)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      it('should return error if the request body is invalid', (done) => {
        // Set up
        const invalidBody = {"title": 123, "budget": 10000, "user_id": "001"};
        // Validation + Exercise
        request(app)
          .put(`/updateEnvelope/${updatingEnvelopeId}`)
          .send(invalidBody)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      // Clean Up
      after(async () => {
        if (preUpdateBody) {
          try {
            // Perform a update operation in the database
            console.log(preUpdateBody[0]);
            await updateEnvelope(updatingEnvelopeId, preUpdateBody[0]);
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        }
      });
    });

    describe('/deleteEnvelope/:id', () => {
      let deletedEnvelopeBody;
    
      it('should delete envelope with matching id in the database', async () => {
        // Setup
        const deletingEnvelopeId = '003';
        deletedEnvelopeBody = await getEnvelope(deletingEnvelopeId);
    
        // Validation + Exercise
        request(app)
          .delete(`/deleteEnvelope/${deletingEnvelopeId}`)
          .expect(204)
          .end( async (err, res) => {
            if (err) return done(err);
            // Check that the envelope is no longer present in the database
            const deletedEnvelope = await query('SELECT * FROM envelope WHERE id = $1', [deletingEnvelopeId]);
            assert.strictEqual(deletedEnvelope.rows.length, 0);
            done();
          });
      });
    
      it('should return status 404 if there is no envelope with matching id', async () => {
        // Set up
        const invalidEnvelopeId = '000';
    
        // Validation + Exercise
        await request(app)
          .delete(`/deleteEnvelope/${invalidEnvelopeId}`)
          .expect(404);
      });
    
      // Clean Up
      after(async () => {
        if (deletedEnvelopeBody) {
          try {
            // Perform a create operation in the database
            await createEnvelope(deletedEnvelopeBody[0]);
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        }
      });
    });

    describe('/tranfer/:giverId/:recieverId/:amount', () => {
      // Setup
      const giverId = '001';
      const recieverId = '002';
      const amount = 5000;
      let tranferStatus = false;
      it('should tranfer the budget from giver envelope to reciever envelope', (done) => {
        // Validation + Exercise
        request(app)
          .post(`/tranfer/${giverId}/${recieverId}/${amount}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            tranferStatus = true;
            done();
          });
      });

      it('should return error if the budget of giver is not enough (below 0)', (done) => {
        // Setup
        const overBudget = 12000;
         // Validation + Exercise
         request(app)
         .post(`/tranfer/${giverId}/${recieverId}/${overBudget}`)
         .expect('Content-Type', 'application/json; charset=utf-8')
         .expect(406)
         .end((err, res) => {
           if (err) return done(err);
           done();
         });
      });

      it('should return error if either envelope id is not found', (done) => {
        // Setup
        const falseGiverId = '000';
        const falseReceiverId = '100';
         // Validation + Exercise
         request(app)
         .post(`/tranfer/${falseGiverId}/${falseReceiverId}/${amount}`)
         .expect('Content-Type', 'application/json; charset=utf-8')
         .expect(404)
         .end((err, res) => {
           if (err) return done(err);
           done();
         });
      });

      // Clean Up
      after(async () => {
        if (tranferStatus) {
          try {
            // Perform a tranfer operation in the database
            await tranferEnvelope(recieverId, giverId, amount);
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        }
      });
    });
});