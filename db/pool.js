const Pool = require('pg').Pool

// Pool Configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Personal Budget II',
  password: 'postgres',
  port: 5432,
});

const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
};

module.exports = query;