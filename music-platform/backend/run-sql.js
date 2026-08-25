const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.csygbaiwqcdzzyajipua',
  password: '@Elcanop2396',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres!');
    const sql = fs.readFileSync('schema.sql', 'utf8');
    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await client.end();
  }
}

run();
