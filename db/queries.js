const query = require('./pool');
const { isValidEnvelopeBody, isValidUpdateBody } = require('../utils/utils');

const getEnvelopes = async () => {
    try {
        const results = await query('SELECT * FROM envelope ORDER BY id ASC');
        return results.rows
    } catch (error) {
        console.error('Error fetching envelopes:', error);
        throw error;
    };
};

const getEnvelope = async (id) => {
    try {
      const results = await query('SELECT * FROM envelope WHERE id = $1', [id]);
      if (results.rows.length > 0) {
        return results.rows;
      } else {
        const notFoundError = new Error('No envelope with the id found');
        notFoundError.status = 404;
        throw notFoundError;
      }
    } catch (error) {
      console.error('Error fetching envelopes', error);
      throw error;
    }
  };

const createEnvelope = async (body) => {
    try {

        if (!isValidEnvelopeBody(body)) {
            const invalidReqError = new Error('Invalid Request Body');
            invalidReqError.status = 400;
            throw invalidReqError;
        }

        await query('INSERT INTO envelope (id, title, budget, user_id) VALUES ($1, $2, $3, $4)', 
        [body.id, body.title, body.budget, body.user_id]); 

    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL error code for unique constraint violation
        const duplicateError = new Error('Duplicate envelope data');
        duplicateError.status = 409; // Conflict status code
        throw duplicateError;
      } else {
        // Handle other database errors
        console.error('Error Creating Envelope', error);
        throw error;
      }
    }
};

const updateEnvelope = async (id, body) => {
  try {

    if (!isValidUpdateBody(body)) {
      const invalidReqError = new Error('Invalid Request Body');
      invalidReqError.status = 400;
      throw invalidReqError;
    }

    await query('UPDATE envelope SET title = $1, budget = $2, user_id = $3 WHERE id = $4', 
    [body.title, body.budget, body.user_id, id] )

  } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL error code for unique constraint violation
        const duplicateError = new Error('Duplicate envelope data');
        duplicateError.status = 409; // Conflict status code
        throw duplicateError;
      } else {
        // Handle other database errors
        console.error('Error Creating Envelope', error);
        throw error;
      }
    }
};

const deleteEnvelope = async (id) => {
  try {
    await query('DELETE FROM envelope WHERE id = $1', [id]);
  } catch (error) {
    throw error;
  }
};

const tranferEnvelope = async (giver, reciever, amount) => {
  try {
    const giverEnvelope = await getEnvelope(giver);
    const recieverEnvelope = await getEnvelope(reciever);
    // Check amount is integer
    if (!Number.isInteger(amount)) {
      const invalidAmount = new Error('Invalid Amount Input')
      invalidAmount.status = 400;
      throw invalidAmount;
    }

    // Evaluate the giver's budget
    if ((giverEnvelope[0].budget - amount) < 0) {
      const notEnoughBudget = new Error('Not enough budget in the giver envelope')
      notEnoughBudget.status = 406;
      throw notEnoughBudget;
    }
    // Caculate Balance
    const newGiverBudget = giverEnvelope[0].budget - amount;
    const newRecieverBudget = recieverEnvelope[0].budget + amount;
    console.log('Giver: ' + newGiverBudget)
    console.log(amount);
    console.log('Reciever: ' + newRecieverBudget);
    // Execute query
    await query('UPDATE envelope SET budget = $1 WHERE id = $2', [newGiverBudget, giver])
    await query('UPDATE envelope SET budget = $1 WHERE id = $2', [newRecieverBudget, reciever])
  } catch (error) {
    throw error;
  }
};
    

module.exports = {getEnvelopes, getEnvelope, createEnvelope, updateEnvelope, deleteEnvelope, tranferEnvelope};


    
  