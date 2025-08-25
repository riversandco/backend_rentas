// index.js — versión Postgres (Supabase) con CommonJS
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  // pon aquí tu dominio real del frontend si quieres restringirlo:
  // origin: ['https://tu-frontend.vercel.app'],
  credentials: true,
}));
app.use(express.json()); // ya no necesitas body-parser

// DB: usa la cadena de Supabase que pones en Render como DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // necesario con Supabase
});

// Crear tablas si no existen (equivalente a tu schema SQLite)
async function initDb() {
  await pool.query(`
    create table if not exists propiedades (
      id serial primary key,
      tipo text,
      ubicacion text,
      estado text,
      notas text
    );
  `);
  await pool.query(`
    create table if not exists inquilinos (
      id serial primary key,
      nombre text,
      telefono text,
      email text,
      propiedad_id integer references propiedades(id) on delete set null,
      contrato_inicio text,
      contrato_fin text,
      renta_mensual numeric(12,2)
    );
  `);
  await pool.query(`
    create table if not exists pagos (
      id serial primary key,
      inquilino_id integer references inquilinos(id) on delete cascade,
      propiedad_id integer references propiedades(id) on delete cascade,
      fecha_pago text,
      mes_correspondiente text,
      monto numeric(12,2),
      estado text
    );
  `);
  console.log('Tablas listas ✅');
}

// Rutas mínimas de prueba (puedes agregar las tuyas)
app.get('/', (req, res) => {
  res.send('Backend de rentas funcionando ✅ (Postgres)');
});

app.get('/propiedades', async (_req, res) => {
  try {
    const { rows } = await pool.query('select * from propiedades order by id desc;');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al listar propiedades' });
  }
});

app.post('/propiedades', async (req, res) => {
  try {
    const { tipo, ubicacion, estado, notas } = req.body;
    const { rows } = await pool.query(
      `insert into propiedades (tipo, ubicacion, estado, notas)
       values ($1,$2,$3,$4) returning *;`,
      [tipo || null, ubicacion || null, estado || null, notas || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al guardar propiedad' });
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error inicializando DB:', err);
  process.exit(1);
});

