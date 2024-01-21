const budgetRouter = require('express').Router();

// Importing Quries 
const { getEnvelopes } = require('../db/queries');

// Get all envelopes
budgetRouter.get('/getEnvelopes', async (req, res, next) => {
  try {
    const respond = await getEnvelopes();
    res.status(200).json(respond);
  } catch (error) {
    next(error);
  }
});



module.exports = budgetRouter;


