// server.js
const express = require('express');
const { sequelize, ulrsProductos, HistorialPrecios, AlertaPrecio, Producto, Inventario, Usuario, zapatillasWebs } = require('./routes/basedatos.js');
const routes = require('./routes/index');


const app = express();
const port = 1234;
const path = require('path');

app.use(express.json());

// Sirve archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../frontend/public')));



app.use('/api', routes);

async function dropTables() {
  await AlertaPrecio.drop();
  await HistorialPrecios.drop();
  await ulrsProductos.drop();
  await zapatillasWebs.drop();
  await Producto.drop();
  await Inventario.drop();
  await Usuario.drop();
}

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