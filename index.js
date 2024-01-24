const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000;

// Middleware for logging
app.use(morgan('short'));

// Add middleware for handling CORS requests from index.html
app.use(cors());

// Add middware for parsing request bodies here:
app.use(bodyParser.json());

// Mount api router
const budgetRouter = require('./api/budget');
app.use('/', budgetRouter);

//// Error Handling Middle Ware 
const errorHandler = (err, req, res, next) => {
    if (!err.status) {
      err.status = 500;
    }
  
    if (!err.message) {
      err.message = "Server Error";
    }
  
    // Log the error details for debugging
    console.error(`Error ${err.status}: ${err.message}`);
    console.error(err.stack);
  
    // Send a response to the client
    res.status(err.status).json(err.message);
  };
  app.use(errorHandler);

// Server starting
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;