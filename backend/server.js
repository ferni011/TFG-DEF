// server.js
const express = require('express');
const { sequelize, urlsProductos, HistorialPrecios, AlertaPrecio, Producto, Inventario, Usuario, zapatillasWebs } = require('./routes/basedatos.js');
const routes = require('./routes/index');
const cors = require('cors');
const cron = require('node-cron');


const app = express();
const port = 1234;
const path = require('path');

app.use(express.json());
app.use(cors())

// Sirve archivos estáticos desde la carpeta public
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend', 'build', 'index.html'));
// });

app.use('/api', routes);

// async function dropTables() {
//   await AlertaPrecio.drop();
//   await HistorialPrecios.drop();
//   await zapatillasWebs.drop();
//   await urlsProductos.drop();
//   await Producto.drop();
//   await Inventario.drop();
//   await Usuario.drop();
// }

// dropTables().then(() => {
//   sequelize.sync({
//     force: true
//   }).then(() => {
//     console.log("Tablas sincronizadas");
//   });
// });

sequelize.sync().then(() => {
  console.log("Tablas sincronizadas");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});