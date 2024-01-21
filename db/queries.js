const query = require('./pool');

const getEnvelopes = async () => {
    try {
        const results = await query('SELECT * FROM envelope ORDER BY id ASC');
        return results.rows
    } catch (error) {
        console.error('Error fetching envelopes:', error);
        throw error;
    };
};

module.exports = {getEnvelopes};


    
  