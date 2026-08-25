const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.csygbaiwqcdzzyajipua',
  password: '@Elcanop2396',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    // Crear el bucket
    await client.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('reference_audios', 'reference_audios', true) 
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Crear la política para permitir a los administradores de servicio hacer de todo,
    // o para acceso público de lectura si quisiéramos.
    // Como Vercel usará la service_role, puede subir/borrar.
    console.log('Bucket "reference_audios" creado correctamente en Supabase.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
