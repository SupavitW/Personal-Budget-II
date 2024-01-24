const budgetRouter = require('express').Router();

// Importing Quries 
const { getEnvelopes,
        getEnvelope, 
        createEnvelope, 
        updateEnvelope, 
        deleteEnvelope, 
        tranferEnvelope } = require('../db/queries');

// Render Health Check Path

budgetRouter.get("/health", (req, res) => { 
  res.sendStatus(200); 
}); 

// Router parameter for id
budgetRouter.param('id', async (req, res, next, id) => {
  try {
    const envelope = await getEnvelope(req.params.id);
    req.id = id; 
    req.envelope = envelope;
    next();
  } catch (error) {
    next(error);
  }
});

// Get all envelopes
budgetRouter.get('/getEnvelopes', async (req, res, next) => {
  try {
    const results = await getEnvelopes();
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// Get an envelope with id
budgetRouter.get('/getEnvelope/:id', (req, res, next) => {
  res.status(200).json(req.envelope);
});

// Create an envelope
budgetRouter.post('/createEnvelope', async (req, res, next) => {
  try {
    await createEnvelope(req.body);
    res.status(201).json(req.body);
  } catch (error) {
    next(error);
  }
});

// Update an envelope with id
budgetRouter.put('/updateEnvelope/:id', async (req, res, next) => {
  try {
    await updateEnvelope(req.id, req.body);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

// Delete an envelope with id
budgetRouter.delete('/deleteEnvelope/:id', async (req, res, next) => {
  try {
    await deleteEnvelope(req.id);
    res.status(204).send();
  } catch (error) {
    next (error);
  }
});

// Tranfer the budget from an envelope to another by id
budgetRouter.post('/tranfer/:giverId/:recieverId/:amount', async (req, res, next) => {
  try {
    const amount = parseInt(req.params.amount);
    await tranferEnvelope(req.params.giverId, req.params.recieverId, amount);
    res.status(201).json('Transaction sucess');
  } catch (error) {
    next(error);
  }
});


module.exports = budgetRouter;


