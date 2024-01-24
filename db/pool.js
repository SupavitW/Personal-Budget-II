const Pool = require('pg').Pool
const DATABASE_URL = process.env.DATABASE_URL;

// Pool Configuration
const pool = new Pool({
  connectionString: DATABASE_URL,
});

const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
};

module.exports = query;
