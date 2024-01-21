const request = require('supertest');
const assert = require('assert');
const app = require('../index');

describe('Get all envelopes', () => {
    describe('/getEnvelopes', () => {
        it('should return status 200 and the envelopes data', (done) => {
          // Setup
          const expectedEnvelopeStructure = {
            id: String,
            title: String,
            budget: Number,
            user_id: String
          };
          // Validation + Excersie
          request(app)
            .get('/getEnvelopes')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              assert.ok(Array.isArray(res.body), 'Expected response body to be an array');

              // Check that envelopes has the right structure
              res.body.forEach(envelope => {
                assert.deepEqual(Object.keys(envelope).sort(), Object.keys(expectedEnvelopeStructure).sort(), 'Envelope has the correct structure');
              });
              done();
            });
        });
    });
});