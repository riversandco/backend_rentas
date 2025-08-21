const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// DB
const db = new sqlite3.Database('./rentas.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS propiedades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    ubicacion TEXT,
    estado TEXT,
    notas TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inquilinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    telefono TEXT,
    email TEXT,
    propiedad_id INTEGER,
    contrato_inicio TEXT,
    contrato_fin TEXT,
    renta_mensual REAL,
    FOREIGN KEY(propiedad_id) REFERENCES propiedades(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquilino_id INTEGER,
    propiedad_id INTEGER,
    fecha_pago TEXT,
    mes_correspondiente TEXT,
    monto REAL,
    estado TEXT,
    FOREIGN KEY(inquilino_id) REFERENCES inquilinos(id),
    FOREIGN KEY(propiedad_id) REFERENCES propiedades(id)
  )`);
});

app.get('/', (req, res) => {
  res.send('Backend de rentas funcionando ✅');
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
