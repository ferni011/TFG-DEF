// index.js
const express = require('express');
const router = express.Router();
const { sequelize, createProducto, createUsuario, createInventario, actualizaPrecioProducto, devolverproductoId, agregaEnlacesProducto, eligeWebsZapatilla, obtenerUrlsProducto, obtenerWebsElegidas, modificaSelector, devuelveInventarios, iniciarSesion, eliminarUsuario, modificarUsuario, obtenerProductos, eliminarProducto, editarInventario, editarProducto, eliminarUrl, obtenerPreciosProducto, crearAlertaPrecio, editarAlertaPrecio, eliminaAlertaPrecio, obtenerAlerta, precioActualProducto, eliminarInventario, buscarProductos, obtenerAlertas, obtenerAlertasUsuario, obtenerUsuario, marcarAlerta, obtenerUsuarioPorAlerta, Usuario } = require('./basedatos.js');
const llamadaComparaPayout = require('../scripts/scrapping.js');
const { precioSelectorPrimeraVez, actualizamosPrecioProducto } = require('../scripts/general.js');
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const multer = require('multer');
const path = require('path');
require('dotenv').config();


let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAILUSADO,
    pass: process.env.CONTRASENAAPP
  }
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../imagenes/'));
  },
  filename: function (req, file, cb) {
    const originalName = path.basename(file.originalname);
    cb(null, new Date().toISOString().replace(/:/g, '-') + originalName);
  }
});

const upload = multer({ storage: storage });


//Método para guardar el mejor precio de una zapatilla
router.post('/zapatillaPrecio', async (req, res) => {
  const id = req.body.id;
  let SKU;
  let TALLA;
  const zapatilla = await devolverproductoId(id);
  try {
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
    let precioMax = await actualizaPrecioProducto(id, preciosArray, zapatilla.superior ? true : false);
    res.status(201).json({ precioMax });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while calculating the payout.' });
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
router.post('/zapatilla', upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, SKU, talla, idInventario, superior } = req.body;

  let imagen;
  if (req.file && req.file.filename) {
    imagen = 'http://localhost:1234/imagenes/' + req.file.filename;
  }

  console.log("Nombre: " + nombre)
  console.log("Descripcion: " + descripcion)
  console.log("Imagen: " + imagen)
  console.log("SKU: " + SKU)
  console.log("Talla: " + talla)
  console.log("ID Inventario: " + idInventario)
  console.log("Superior: " + superior)

  try {
    const zapatilla = await createProducto(nombre, descripcion, imagen, SKU, talla, true, idInventario, superior);
    res.status(201).json(zapatilla);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while creating the zapatilla.' });
  }
});

//Método para crear producto
router.post('/producto', upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, SKU, talla, idInventario, superior } = req.body;


  let imagen;
  if (req.file && req.file.filename) {
    imagen = 'http://localhost:1234/imagenes/' + req.file.filename;
  }

  try {
    const producto = await createProducto(nombre, descripcion, imagen, SKU, talla, false, idInventario, superior);
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
        if (producto !== null) {
          const precio = producto.content;
          console.log('Precio obtenido:', precio);
          await modificaSelector(url.url, producto.selector);
          const precioFloat = parseFloat(precio.replace(',', '.'));
          precios.push({ tienda: url.url, precio: precioFloat });
          console.log("LOS PRECIOS SON " + JSON.stringify(precios[0]));
        } else {
          console.log('No se pudo obtener el producto');
          precios.push({ tienda: url.url, precio: null });
        }
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
          await modificaSelector(url.url, null);
        }
      }
    }
    console.log('Actualizando precio del producto en la base de datos...');

    let producto = await devolverproductoId(id);

    console.log(producto.superior);

    let precioMinimo = await actualizaPrecioProducto(id, precios, producto.superior ? true : false);
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


router.get('/inventariosProductos', async (req, res) => {
  const idUsuario = req.query.idUsuario;
  try {
    const inventarios = await devuelveInventarios(idUsuario, true);
    res.json(inventarios);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the inventarios.' });
  }
});

router.get('/inventariosZapatillas', async (req, res) => {
  const idUsuario = req.query.idUsuario;
  try {
    const inventarios = await devuelveInventarios(idUsuario, false);
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
    res.status(400).send({ error: err.message });
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
    const usuarioModificado = await modificarUsuario(id, nombre, email, contrasenaNueva, contrasena);
    res.status(201).json(usuarioModificado);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: err.message });
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

router.get('/obtenerProducto', async (req, res) => {
  const id = req.query.id;
  try {
    const producto = await devolverproductoId(id);
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the producto.' });
  }
});

router.put('/modificarProducto', upload.single('imagen'), async (req, res) => {
  const { id, nombre, descripcion, SKU, talla, superior } = req.body;
  const imagen = req.file ? 'http://localhost:1234/imagenes/' + req.file.filename : null;

  try {
    await editarProducto(id, nombre, descripcion, imagen, SKU, talla, superior);
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
  }
});


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
  console.log("ID: " + id);
  console.log("Precio: " + precio);
  console.log("Superior: " + superior);

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

// let tarea;

// router.get('/pruebaCron', async (req, res) => {
//   try {
//     tarea = cron.schedule('*/1 * * * *', async () => {
//       try {
//         SKU = "ID2349"
//         TALLA = "42"

//         let webs = await obtenerWebsElegidas(12);

//         const result = await llamadaComparaPayout(SKU, TALLA, webs);
//         console.log(result)
//         let precioKlekt = result.payoutKlekt !== null ? parseFloat(result.payoutKlekt) : null;
//         let precioHypeboost = result.payoutHypeboost !== null ? parseFloat(result.payoutHypeboost) : null;
//         let precioLaced = result.payoutLaced !== null ? parseFloat(result.payoutLaced) : null;

//         let precios = {
//           klekt: precioKlekt,
//           hypeboost: precioHypeboost,
//           laced: precioLaced
//         }

//         if (!Object.values(precios).some(price => price !== null)) {
//           res.status(400).send({ error: 'Todos los precios son null, intentalo de nuevo' });
//           return;
//         }

//         let preciosArray = Object.entries(precios).map(([tienda, precio]) => ({ tienda, precio }));
//         let precioMax = Math.max(...preciosArray.map(p => p.precio));

//         let precioActual = await precioActualProducto(12);
//         console.log(precioActual);
//         if (precioMax > precioActual) {
//           let actualizado = await actualizaPrecioProducto(12, preciosArray, true);
//           if (actualizado) {
//             let mailOptions = {
//               from: 'cuentatfgfer@gmail.com',
//               to: 'fernandopastranago11@gmail.com',
//               subject: 'Precio del producto actualizado',
//               text: 'El precio del producto ha sido actualizado.'
//             };

//             transporter.sendMail(mailOptions, function (error, info) {
//               if (error) {
//                 console.log(error);
//               } else {
//                 console.log('Email sent: ' + info.response);
//               }
//             });

//           }
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     });
//     res.status(201).send("Tarea programada");
//   } catch (err) {
//     console.error(err);
//     res.status(400).send({ error: 'An error occurred while scheduling' });
//   }
// });

// router.get('/pararCron', async (req, res) => {
//   if (tarea) {
//     tarea.stop();
//     res.status(201).send("Tarea parada");
//   }
//   else {
//     res.status(400).send("No hay tarea programada");
//   }
// });

router.delete('/eliminarInventario', async (req, res) => {
  const { id } = req.query;
  try {
    await eliminarInventario(id);
    res.status(201).send("Inventario eliminado");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'An error occurred while deleting' });
  }
});

router.get('/buscarProductos', async (req, res) => {
  const { nombre, usuario } = req.query;
  try {
    const productos = await buscarProductos(nombre, usuario);
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the productos.' });
  }
});


router.get('/ejecutaAlertas', async (req, res) => {
  try {
    cron.schedule('*/1 * * * *', async () => { // se ejecuta cada 5 minutos
      let alertas = await obtenerAlertas();

      for (let alerta of alertas) {
        const data = await obtenerUsuarioPorAlerta(alerta.id);
        const email = data.dataValues.email;
        if (!alerta.dataValues.lanzada) {
          console.log("La alerta es", alerta)
          console.log("El id es", alerta.idProducto)
          let productoActual = await devolverproductoId(alerta.idProducto);
          let precioActual = alerta.precio;

          console.log(productoActual)

          if (productoActual.zapatilla) {
            const { SKU, talla } = productoActual;
            let webs = await obtenerWebsElegidas(alerta.idProducto);

            const result = await llamadaComparaPayout(SKU, talla, webs);
            let precioKlekt = result.payoutKlekt !== null ? parseFloat(result.payoutKlekt) : null;
            let precioHypeboost = result.payoutHypeboost !== null ? parseFloat(result.payoutHypeboost) : null;
            let precioLaced = result.payoutLaced !== null ? parseFloat(result.payoutLaced) : null;

            console.log("El precio de Klekt es: " + precioKlekt);
            console.log("El precio de Hypeboost es: " + precioHypeboost);
            console.log("El precio de Laced es: " + precioLaced);

            let precios = {
              klekt: precioKlekt,
              hypeboost: precioHypeboost,
              laced: precioLaced,
            };

            console.log(precios);

            if (!Object.values(precios).some(price => price !== null)) {
              console.log('Todos los precios son null, intentalo de nuevo');
              return;
            }

            let preciosArray = Object.entries(precios).map(([tienda, precio]) => ({ tienda, precio }));
            let precioMax;

            if (alerta.superior) {
              precioMax = Math.max(...preciosArray.map(p => p.precio));
            } else {
              precioMax = Math.min(...preciosArray.map(p => p.precio));
            }

            if (alerta.superior ? (precioMax > precioActual) : (precioMax < precioActual)) {
              let mailOptions = {
                from: 'cuentatfgfer@gmail.com',
                to: email,
                subject: alerta.superior ? `El precio de la zapatilla ha superado el precio de ${precioActual}` : `El precio de la zapatilla se encuentra por debajo de ${precioActual}`,
                text: `El precio actual es de ${precioMax}€`,
              };

              marcarAlerta(alerta.id);

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
            } else {
              console.log("No se ha superado el precio de la alerta");
            }
          } else {
            const urls = await obtenerUrlsProducto(alerta.idProducto);
            let precios = [];

            for (let url of urls) {
              if (url.selector == null) {
                console.log('Selector no encontrado, vuelve a obtener precio producto');
                continue;
              } else {
                console.log("Actualizamos precio producto okey")
                const precio = await actualizamosPrecioProducto(url.url, url.selector);
                if (precio != null) {
                  const precioFloat = parseFloat(precio.replace(',', '.'));
                  precios.push({ tienda: url.url, precio: precioFloat });
                } else {
                  modificaSelector(url.url, null);
                }
              }
            }

            let precioMax;
            if (alerta.superior) {
              console.log("Alerta superior")
              precioMax = Math.max(...precios.map(p => p.precio));
              console.log("Precio maximo es ", precioMax)
              if (precioMax > precioActual) {
                let mailOptions = {
                  from: 'cuentatfgfer@gmail.com',
                  to: email,
                  subject: `El precio del producto ha superado el precio de ${precioActual}`,
                  text: `El precio actual es de ${precioMax}€`,
                };

                marcarAlerta(alerta.id);

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
              }
            } else {
              console.log("Alerta inferior")
              console.log("Precios son ", precios.map(p => p.precio))
              precioMax = Math.min(...precios.map(p => p.precio));
              console.log("Precio minimo es ", precioMax)
              console.log("Precio actual ", precioActual)
              if (precioMax < precioActual) {
                let mailOptions = {
                  from: 'cuentatfgfer@gmail.com',
                  to: email,
                  subject: `El precio de la zapatilla se encuentra por debajo de ${precioActual}`,
                  text: `El precio actual es de ${precioMax}€`,
                };

                marcarAlerta(alerta.id);

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
              }
            }
          }
        }
      }
    });

    res.send({ message: 'Alertas ejecutadas correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while executing the alerts.' });
  }
});



router.get('/obtenerWebsElegidas', async (req, res) => {
  const id = req.query.id;
  try {
    const webs = await obtenerWebsElegidas(id);
    res.json(webs);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the webs.' });
  }
});


router.get('/obtenerUsuario', async (req, res) => {
  const id = req.query.id;
  try {
    const usuario = await obtenerUsuario(id);
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the usuario.' });
  }
});


router.get('/obtenerAlertasUsuario', async (req, res) => {
  const idUsuario = req.query.idUsuario;
  try {
    const alertas = await obtenerAlertasUsuario(idUsuario);
    res.json(alertas);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while retrieving the alertas.' });
  }
});

module.exports = router;