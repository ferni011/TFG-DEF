// index.js
const express = require('express');
const router = express.Router();
const {sequelize, createProducto, createUsuario, createInventario, actualizaPrecioProducto, devolverproductoId, agregaEnlacesProducto, eligeWebsZapatilla, obtenerUrlsProducto, obtenerWebsElegidas } = require('./basedatos.js');
const llamadaComparaPayout = require('../scripts/scrapping.js'); 
const llamadaEligePrecio = require('../scripts/general.js');


//Método para guardar el mejor precio de una zapatilla
router.post('/zapatillaPrecio', async (req, res) => {
    const id = req.body.id;
    let SKU;
    let TALLA;
    try {
      const zapatilla = await devolverproductoId(id);
      if(zapatilla.zapatilla){
        SKU = zapatilla.SKU;
        TALLA = zapatilla.talla;
      }else{
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

      let precioMax = Math.max(precioKlekt, precioHypeboost, precioLaced);
      if (isNaN(precioMax)) {
        res.status(400).send({ error: 'Error al scrapear los precios, intentalo de nuevo' });
        return;
      }
      console.log("El precio máximo es: " + precioMax);

      await actualizaPrecioProducto(id, precioMax);
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
      console.log("EL ID ES:" +id);
      console.log("LA ZAPATILLA ES:"+ zapatilla.SKU);
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
      res.status(201).json(usuario);
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
    try{
      const urls = await agregaEnlacesProducto(id, enlaces);
      res.status(201).json(urls);
    }
    catch(err){
      console.error(err);
      res.status(400).send({ error: 'An error occurred while creating the enlace.' });
    }
  });

  //Método para guardar precio mínimo producto
  router.post('/precioProducto', async (req, res) => {
    const { id } = req.body;
    try{
      const urls = await obtenerUrlsProducto(id);
      const precios = [];

      for (let url of urls){
        const precio = await llamadaEligePrecio(url.url);
        // Reemplaza las comas por puntos y luego convierte a float
        const precioFloat = parseFloat(precio.replace(',', '.'));
        precios.push(precioFloat);
      }

      const precioMinimo = Math.min(...precios);
      console.log("El precio mínimo es: " + precioMinimo);

      await actualizaPrecioProducto(id, precioMinimo);
      res.status(201).json({ precioMinimo });

    }
    catch(err){
      console.error(err);
      res.status(400).send({ error: 'An error occurred while creating the enlace.' });
    }

  });

  //Método para elegir en que webs buscar una zapatilla
  router.post('/eligeWebs', async (req, res) => {
    const { id, webs } = req.body;
    try{
      const zapatilla = await eligeWebsZapatilla(id, webs);
      res.status(201).json(zapatilla);
    }
    catch(err){
      console.error(err);
      res.status(400).send({ error: 'An error occurred while creating the enlace.' });
    }

  });


module.exports = router;