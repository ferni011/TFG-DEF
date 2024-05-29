// index.js
const express = require('express');
const router = express.Router();
const { sequelize, createProducto, createUsuario, createInventario, actualizaPrecioProducto, devolverproductoId, agregaEnlacesProducto, eligeWebsZapatilla, obtenerUrlsProducto, obtenerWebsElegidas, modificaSelector, devuelveInventarios, iniciarSesion, eliminarUsuario, modificarUsuario, obtenerProductos, eliminarProducto, editarInventario, editarProducto, eliminarUrl, obtenerPreciosProducto, crearAlertaPrecio, editarAlertaPrecio, eliminaAlertaPrecio, obtenerAlerta } = require('./basedatos.js');
const llamadaComparaPayout = require('../scripts/scrapping.js');
const { precioSelectorPrimeraVez, actualizamosPrecioProducto } = require('../scripts/general.js');


//Método para guardar el mejor precio de una zapatilla
router.post('/zapatillaPrecio', async (req, res) => {
  const id = req.body.id;
  let SKU;
  let TALLA;
  try {
    const zapatilla = await devolverproductoId(id);
    if (zapatilla.zapatilla) {
      SKU = zapatilla.SKU;
      TALLA = zapatilla.talla;
    } else {
      res.status(400).send({ error: 'El producto no es una zapatilla.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the zapatilla.' });
  }

  console.log(SKU);
  console.log(TALLA);
  console.log(id);

  webs = await obtenerWebsElegidas(id);

  try {
    const result = await llamadaComparaPayout(SKU, TALLA, webs);
    console.log(result)
    let precioKlekt = result.payoutKlekt !== null ? parseFloat(result.payoutKlekt) : null;
    let precioHypeboost = result.payoutHypeboost !== null ? parseFloat(result.payoutHypeboost) : null;
    let precioLaced = result.payoutLaced !== null ? parseFloat(result.payoutLaced) : null;

    console.log("El precio de Klekt es: " + precioKlekt)
    console.log("El precio de Hypeboost es: " + precioHypeboost)
    console.log("El precio de Laced es: " + precioLaced)

    let precios = {
      klekt: precioKlekt,
      hypeboost: precioHypeboost,
      laced: precioLaced
    }

    console.log(precios);

    if (!Object.values(precios).some(price => price !== null)) {
      res.status(400).send({ error: 'Todos los precios son null, intentalo de nuevo' });
      return;
    }

    let preciosArray = Object.entries(precios).map(([tienda, precio]) => ({ tienda, precio }));
    let precioMax = await actualizaPrecioProducto(id, preciosArray, true);
    res.status(201).json({ precioMax });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while calculating the payout.' });
  }
});

//Método para obtener una zapatilla por su id
router.get('/zapatilla/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const zapatilla = await devolverproductoId(id);
    console.log("EL ID ES:" + id);
    console.log("LA ZAPATILLA ES:" + zapatilla.SKU);
    res.json(zapatilla);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the zapatilla.' });
  }
});

//Método para obtener todas las zapatillas
router.get('/zapatillas', async (req, res) => {
  try {
    const zapatillas = await devolverZapatillas();
    res.json(zapatillas);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the zapatillas.' });
  }
});


//Método para crear usuario
router.post('/usuario', async (req, res) => {
  const { nombre, email, contrasena } = req.body;

  try {
    const usuario = await createUsuario(nombre, email, contrasena);
    res.status(201).json(usuario.id);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating the usuario.' });
  }
});

//Método para crear inventario
router.post('/inventario', async (req, res) => {
  const { nombre, esProducto, idUsuario } = req.body;

  try {
    const inventario = await createInventario(nombre, esProducto, idUsuario);
    res.status(201).json(inventario);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating the inventario.' });
  }
});

//Método para crear zapatilla
router.post('/zapatilla', async (req, res) => {
  const { nombre, descripcion, imagen, SKU, talla, idInventario } = req.body;

  try {
    const zapatilla = await createProducto(nombre, descripcion, imagen, SKU, talla, true, idInventario);
    res.status(201).json(zapatilla);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating the zapatilla.' });
  }
});

//Método para crear producto
router.post('/producto', async (req, res) => {
  const { nombre, descripcion, imagen, SKU, talla, idInventario } = req.body;

  try {
    const producto = await createProducto(nombre, descripcion, imagen, SKU, talla, false, idInventario);
    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating the producto.' });
  }
});

//Método para añadir enlaces a producto
router.post('/anadeEnlace', async (req, res) => {
  const { id, enlaces } = req.body;
  try {
    const urls = await agregaEnlacesProducto(id, enlaces);
    res.status(201).json(urls);
  }
  catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating the enlace.' });
  }
});

//Método para guardar precio mínimo producto
router.post('/precioProducto', async (req, res) => {
  console.log('Inicio de la ruta /precioProducto');
  const { id } = req.body;
  console.log('ID del producto:', id);
  try {
    console.log('Obteniendo URLs del producto...');
    const urls = await obtenerUrlsProducto(id);
    console.log('URLs del producto:', urls);
    let precios = [];

    for (let url of urls) {
      console.log('Procesando URL:', url.url);
      if (url.selector == null) {
        console.log('Obteniendo precio y selector por primera vez...');
        const producto = await precioSelectorPrimeraVez(url.url);
        const precio = producto.content;
        console.log('Precio obtenido:', precio);
        await modificaSelector(url.url, producto.selector);
        const precioFloat = parseFloat(precio.replace(',', '.'));
        precios.push({ tienda: url.url, precio: precioFloat });
        console.log("LOS PRECIOS SON " + JSON.stringify(precios[0]));
      }
      else {
        console.log('Actualizando precio del producto...');
        const precio = await actualizamosPrecioProducto(url.url, url.selector);
        console.log("El precio es:" + precio);
        if (precio != null) {
          const precioFloat = parseFloat(precio.replace(',', '.'));
          console.log("El precio es:" + precioFloat);
          precios.push({ tienda: url.url, precio: precioFloat });
        }
        else {
          console.log('El precio es null, modificando selector...');
          modificaSelector(url.url, null);
        }
      }
    }
    console.log('Actualizando precio del producto en la base de datos...');
    let precioMinimo = await actualizaPrecioProducto(id, precios, false);
    console.log('Precio mínimo:', precioMinimo);
    res.status(201).json({ precioMinimo });
  }
  catch (err) {
    console.error('Error:', err);
    res.status(400).send({ error: 'Error al obtener precio de producto.' });
  }
});


//Método para elegir en que webs buscar una zapatilla
router.post('/eligeWebs', async (req, res) => {
  const { id, webs } = req.body;
  try {
    const zapatilla = await eligeWebsZapatilla(id, webs);
    res.status(201).json(zapatilla);
  }
  catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating the enlace.' });
  }

});


router.get('/inventarios', async (req, res) => {
  const idUsuario = req.query.idUsuario;
  try {
    const inventarios = await devuelveInventarios(idUsuario);
    res.json(inventarios);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the inventarios.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const usuario = await iniciarSesion(email, contrasena);
    res.status(201).json(usuario);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while login' });
  }
});

router.delete('/eliminarUsuario', async (req, res) => {
  const { id, contrasena } = req.body;
  try {
    const usuario = await eliminarUsuario(id, contrasena);
    res.status(201).send("Usuario eliminado");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while deleting' });
  }
});

router.put('/modificarUsuario', async (req, res) => {
  const { id, nombre, email, contrasenaNueva, contrasena } = req.body;

  console.log("ID: " + id);
  console.log("Nombre: " + nombre);
  console.log("Email: " + email);
  console.log("Contraseña: " + contrasena);
  console.log("Contraseña nueva: " + contrasenaNueva);

  try {
    await modificarUsuario(id, nombre, email, contrasenaNueva, contrasena);
    res.status(201).send("Usuario modificado");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while modifying' });
  }
});

router.get('/productos', async (req, res) => {
  const idInventario = req.query.idInventario;
  try {
    const productos = await obtenerProductos(idInventario);
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the productos.' });
  }
});


router.delete('/eliminarProducto', async (req, res) => {
  const { id } = req.query;
  try {
    const producto = await eliminarProducto(id);
    res.status(201).send("Producto eliminado");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while deleting' });
  }
});

router.put('/modificarInventario', async (req, res) => {
  const { id, nombre } = req.body;
  try {
    await editarInventario(id, nombre);
    res.status(201).send("Inventario modificado");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while modifying' });
  }
});

router.get('/producto/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const producto = await devolverproductoId(id);
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the producto.' });
  }
});

router.put('/modificarProducto', async (req, res) => {
  const { id, nombre, descripcion, imagen, SKU, talla } = req.body;
  try {
    await editarProducto(id, nombre, descripcion, imagen, SKU, talla);
    res.status(200).send("Producto modificado");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while modifying' });
  }
});

router.delete('/eliminarUrl', async (req, res) => {
  const { idProducto, url } = req.body;
  try {
    const producto = await eliminarUrl(idProducto, url);
    res.status(201).send("Url eliminada");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while deleting' });
  }});


router.get('/obtenerEnlacesProducto', async (req, res) => {
  const id = req.query.id;
  try {
    const urls = await obtenerUrlsProducto(id);
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the urls.' });
  }
});

router.get('/obtenerPreciosProducto', async (req, res) => {
  const id = req.query.id;
  try {
    const precios = await obtenerPreciosProducto(id);
    res.json(precios);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the precios.' });
  }
});

router.post('/crearAlertaPrecio', async (req, res) => {
  const { idProducto, precio, superior } = req.body;
  try {
    await crearAlertaPrecio(idProducto, precio, superior);
    res.status(201).send("Alerta creada");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating' });
  }
});

router.delete('/eliminarAlertaPrecio', async (req, res) => {
  const { id } = req.query;
  try {
    await eliminaAlertaPrecio(id);
    res.status(201).send("Alerta eliminada");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while deleting' });
  }
});

router.put('/modificarAlertaPrecio', async (req, res) => {
  const { id, precio, superior } = req.body;
  try {
    await editarAlertaPrecio(id, precio, superior);
    res.status(201).send("Alerta modificada");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while modifying' });
  }
});

router.get('/obtenerAlerta', async (req, res) => {
  const id = req.query.id;
  try {
    const alerta = await obtenerAlerta(id);
    res.json(alerta);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the alerta.' });
  }
});

module.exports = router;