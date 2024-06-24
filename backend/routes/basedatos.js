// productos.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = new Sequelize('Inventario', 'fer', 'fer', {
  host: 'localhost',
  dialect: 'mysql'
});



const Producto = sequelize.define('Producto', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  SKU: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isRequired(value) {
        if (this.zapatilla && !value) {
          throw new Error('SKU es requerido cuando el producto es una zapatilla.');
        }
      },
    },
  },
  talla: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
    validate: {
      isRequired(value) {
        if (this.zapatilla && !value) {
          throw new Error('Talla es requerida cuando el producto es una zapatilla.');
        }
      },
    },
  },
  zapatilla: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  superior: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
});



const Usuario = sequelize.define('Usuario', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Inventario = sequelize.define('Inventario', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  esProducto: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

const AlertaPrecio = sequelize.define('AlertaPrecio', {
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  superior: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  lanzada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }

});

const HistorialPrecios = sequelize.define('HistorialPrecios', {
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tienda: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const urlsProductos = sequelize.define('urlsProductos', {
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  selector: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const zapatillasWebs = sequelize.define('zapatillasWebs', {
  klekt: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  hypeboost: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  laced: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

Usuario.hasOne(Inventario, { foreignKey: 'idUsuario', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Inventario.hasMany(Producto, { foreignKey: 'idInventario', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Producto.hasOne(AlertaPrecio, { foreignKey: 'idProducto', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Producto.hasMany(HistorialPrecios, { foreignKey: 'idProducto', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Producto.hasMany(urlsProductos, { foreignKey: 'idProducto', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Producto.hasOne(zapatillasWebs, { foreignKey: 'idProducto', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

async function createUsuario(nombre, email, contrasena) {
  return new Promise(async (resolve, reject) => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        reject('Formato de correo electrónico no válido');
        return;
      }

      const correoExistente = await Usuario.findOne({ where: { email: email } });
      if (correoExistente) {
        reject('Ya existe un usuario con ese correo electrónico');
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

      const usuario = await Usuario.create({
        nombre: nombre,
        email: email,
        contrasena: contrasenaEncriptada
      });
      resolve(usuario);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

async function createInventario(nombre, esProducto, idUsuario) {
  return new Promise(async (resolve, reject) => {
    try {
      const usuario = await Usuario.findByPk(idUsuario);
      if (!usuario) {
        reject('No existe el usuario con el id proporcionado');
        return;
      }

      const inventario = await Inventario.create({
        nombre: nombre,
        esProducto: esProducto,
        idUsuario: idUsuario
      });
      resolve(inventario);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}



async function createProducto(nombre, descripcion, imagen, SKU, talla, zapatilla, idInventario, superior) {
  return new Promise(async (resolve, reject) => {
    try {

      const inventario = await Inventario.findByPk(idInventario);

      console.log(idInventario)

      if (!inventario) {
        reject('No existe el inventario con el id proporcionado');
        return;
      }
      else if (inventario.esProducto && zapatilla) {
        reject('No se puede añadir una zapatilla a un inventario de productos');
        return;
      }
      else if (!inventario.esProducto && !zapatilla) {
        reject('No se puede añadir un producto a un inventario de zapatillas');
        return;
      }

      let productoData = {
        nombre: nombre,
        descripcion: descripcion,
        SKU: SKU,
        talla: talla,
        zapatilla: zapatilla,
        idInventario: idInventario,
        superior: superior
      };

      if (imagen) {
        productoData.imagen = imagen;
      }
      else{
        productoData.imagen = 'http://localhost:1234/imagenes/default.jpg';
      }
      const producto = await Producto.create(productoData);


      if (zapatilla) {
        await zapatillasWebs.create({
          idProducto: producto.id,
          klekt: true,
          hypeboost: true,
          laced: true
        });
      }
      resolve(producto);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

async function devolverproductoId(id) {
  const producto = await Producto.findByPk(id);
  return producto;
}

async function devolverproductos(zapatilla) {
  const productos = await Producto.findAll({ where: { zapatilla: zapatilla } });
  return productos;
}

/*
precios = array de precio;
precio es un objeto que conteine precio y tienda
precios = [{precio: 100, tienda: 'Amazon'}, {precio: 200, tienda: 'Aliexpress'}]
*/
async function actualizaPrecioProducto(id, precios, maximo) {
  const producto = await Producto.findByPk(id);
  if (producto) {
    let precioMaximo = -Infinity;
    let precioMinimo = Infinity;
    for (let precio of precios) {
      console.log(precio.precio)
      console.log(precio.tienda)
      let precioTienda = precio.precio;
      let tienda = precio.tienda;

      if (precioTienda != null && precioTienda != undefined && !Number.isNaN(precioTienda)) {
        if (precioTienda > precioMaximo) {
          precioMaximo = precioTienda;
        }
        if (precioTienda < precioMinimo) {
          precioMinimo = precioTienda;
        }
        producto[tienda] = precioTienda;
        HistorialPrecios.create({
          precio: precioTienda,
          tienda: tienda,
          idProducto: id
        });
        console.log(`Precio ${tienda} actualizado a ${precioTienda}`); 
      }
    }
    producto.precio = maximo ? precioMaximo : precioMinimo;
    await producto.save();
    return producto.precio;
  }
}



async function agregaEnlacesProducto(id, enlaces) {
  const producto = await Producto.findByPk(id);
  if (producto && !producto.zapatilla) {
    for (const enlace of enlaces) {
      await urlsProductos.create({
        idProducto: id,
        url: enlace
      });
    }
  }
  else if (!producto) {
    throw new Error('No existe el producto con el id proporcionado');
  }
  else if (producto.zapatilla) {
    throw new Error('El producto con el id proporcionado es una zapatilla y no se le pueden añadir enlaces');
  }
}

async function obtenerUrlsProducto(id) {
  const producto = await Producto.findByPk(id);
  if (producto) {
    const urls = await urlsProductos.findAll({ where: { idProducto: id } });
    return urls;
  }
}

async function eligeWebsZapatilla(id, webs) {
  const producto = await Producto.findByPk(id);
  if (producto && producto.zapatilla) {
    const zapatilla = await zapatillasWebs.findOne({ where: { idProducto: id } });
    if (zapatilla) {
      zapatilla.klekt = webs.klekt;
      zapatilla.hypeboost = webs.hypeboost;
      zapatilla.laced = webs.laced;
      await zapatilla.save();
    }
    else {
      throw new Error('No existe la zapatilla con el id proporcionado');
    }
  }
  else if (!producto) {
    throw new Error('No existe el producto con el id proporcionado');
  }
  else if (!producto.zapatilla) {
    throw new Error('El producto con el id proporcionado no es una zapatilla');
  }
}

async function obtenerWebsElegidas(id) {
  const zapatilla = await zapatillasWebs.findOne({ where: { idProducto: id } });
  return zapatilla;
}

async function modificaSelector(url, selector) {
  //DEevuelve todas las url de la base de datos
  const urlEncontrada = await encuentraURL(url)
  if (!urlEncontrada) {
    throw new Error('No existe la url con el id proporcionado');
  } else {
    await urlsProductos.update({ selector: selector }, { where: { id: urlEncontrada.dataValues.id } });
  }

}

async function encuentraURL(url) {
  const urls = urlsProductos.findOne({ where: { url: url } });
  return urls;
}

async function devuelveInventarios(idUsuario, esProducto) {
  const inventarios = await Inventario.findAll({ where: { idUsuario: idUsuario, esProducto: esProducto } });
  return inventarios;
}

async function tipoInventario(idInventario) {
  const inventario = await Inventario.findByPk(idInventario);
  return inventario.esProducto;
}

async function iniciarSesion(email, contrasena) {
  const usuario = await Usuario.findOne({ where: { email: email } });
  if (!usuario) {
    throw new Error('Correo electrónico o contraseña incorrectos');
  }

  const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!contrasenaCorrecta) {
    throw new Error('Correo electrónico o contraseña incorrectos');
  }

  return usuario.id;
}


async function eliminarUsuario(id, contrasenaIngresada) {
  const usuario = await Usuario.findByPk(id);
  if (usuario) {
    const contrasenaCorrecta = await bcrypt.compare(contrasenaIngresada, usuario.contrasena);
    if (contrasenaCorrecta) {
      await usuario.destroy();
    } else {
      throw new Error('Contraseña incorrecta');
    }
  }
}

async function modificarUsuario(id, nombre, email, contrasenaNueva, contrasena) {
  if (!contrasena) {
    throw new Error('La contraseña es obligatoria');
  }

  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new Error('No existe el usuario con el id proporcionado');
  }

  //Modificamos los datos del usuario
  const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);

  if (contrasenaCorrecta) {
    if (nombre) {
      usuario.nombre = nombre;
    }
    if (email) {
      const emailExiste = await Usuario.findOne({ where: { email: email } });
      if (emailExiste && emailExiste.id !== id) {
        throw new Error('Ya existe un usuario con ese correo electrónico');
      }
      usuario.email = email;
    }
    if (contrasenaNueva) {
      const contrasenaEncriptada = await bcrypt.hash(contrasenaNueva, 10);
      usuario.contrasena = contrasenaEncriptada;
    }
    await usuario.save();
    return usuario;
  } else {
    throw new Error('Contraseña incorrecta');
  }
}


async function obtenerProductos(idInventario) {
  const productos = await Producto.findAll({ where: { idInventario: idInventario } });
  return productos;
}


async function editarInventario(id, nombre) {
  const inventario = await Inventario.findByPk(id);
  if (inventario) {
    inventario.nombre = nombre;
    await inventario.save();
  }
}


async function editarProducto(id, nombre, descripcion, imagen, SKU, talla, superior) {
  const producto = await Producto.findByPk(id);
  if (producto) {
    if (nombre !== null && nombre !== undefined) {
      producto.nombre = nombre;
    }
    if (descripcion !== null && descripcion !== undefined) {
      producto.descripcion = descripcion;
    }
    if (imagen !== null && imagen !== undefined) {
      producto.imagen = imagen;
    }
    if (SKU !== null && SKU !== undefined) {
      producto.SKU = SKU;
    }
    if (talla !== null && talla !== undefined) {
      producto.talla = talla;
    }
    if (superior !== null && superior !== undefined) {
      producto.superior = superior;
    }
    await producto.save();
  }
}

async function eliminarUrl(idProducto, url) {
  //Busca el url en urlProductos del idProducto
  const urlEncontrada = await urlsProductos.findOne({ where: { url: url, idProducto: idProducto } });
  if (!urlEncontrada) {
    throw new Error('No existe la url con el id proporcionado');
  }
  else {
    await urlEncontrada.destroy();
  }

}

async function obtenerPreciosProducto(id) {
  const producto = await Producto.findByPk(id);
  if (producto) {
    const historial = await HistorialPrecios.findAll({ where: { idProducto: id } });
    return historial;
  }
}

async function crearAlertaPrecio(idProducto, precio, superior) {
  const alertaExiste = await AlertaPrecio.findOne({ where: { idProducto: idProducto } });
  if (alertaExiste) {
    throw new Error('Ya existe una alerta de precio para este producto');
  }
  const alerta = await AlertaPrecio.create({
    precio: precio,
    superior: superior,
    idProducto: idProducto
  });
  return alerta;
}


async function eliminaAlertaPrecio(id) {
  const alerta = await AlertaPrecio.findOne({ where: { idProducto: id } });
  if (alerta) {
    await alerta.destroy();
  }
}

async function editarAlertaPrecio(id, precio, superior) {
  const alerta = await AlertaPrecio.findOne({ where: { idProducto: id } });
  if (alerta) {
    if (precio) {
      alerta.precio = precio;
    }
    alerta.superior = superior;
    alerta.lanzada = false;
    await alerta.save();
  }
}

async function obtenerAlerta(idProducto) {
  const alertas = await AlertaPrecio.findOne({ where: { idProducto: idProducto } });
  return alertas;
}

async function precioActualProducto(id) {
  const producto = await Producto.findByPk(id);
  return producto.precio;
}

async function eliminarProducto(idProducto) {
  const producto = await Producto.findByPk(idProducto);
  if (producto) {
    //Eliminamos su historial, sus alertas y sus urls
    const historial = await HistorialPrecios.findAll({ where: { idProducto: idProducto } });
    for (const precio of historial) {
      await precio.destroy();
    }
    const alerta = await AlertaPrecio.findOne({ where: { idProducto: idProducto } });
    if (alerta) {
      await alerta.destroy();
    }
    const urls = await urlsProductos.findAll({ where: { idProducto: idProducto } });
    for (const url of urls) {
      await url.destroy();
    }
    await producto.destroy();
  }
  else {
    throw new Error('No existe el producto con el id proporcionado');
  }
}

async function eliminarInventario(id) {
  const inventario = await Inventario.findByPk(id);
  if (inventario) {
    const productos = await Producto.findAll({ where: { idInventario: id } });
    for (const producto of productos) {
      await eliminarProducto(producto.id);
    }
    await inventario.destroy();
  }
}

async function buscarProductos(nombre, usuario) {
  const inventarios = await Inventario.findAll({ where: { idUsuario: usuario } });

  const idInventarios = inventarios.map(inventario => inventario.id);

  const productos = await Producto.findAll({
    where: {
      nombre: {
        [Op.like]: '%' + nombre + '%'
      },
      idInventario: {
        [Op.in]: idInventarios
      }
    }
  });
  return productos;
}


async function obtenerAlertas() {
  return await AlertaPrecio.findAll();
}

async function obtenerAlertasUsuario(idUsuario) {
  const inventarios = await Inventario.findAll({ where: { idUsuario: idUsuario } });
  const idInventarios = inventarios.map(inventario => inventario.id);
  const productos = await Producto.findAll({ where: { idInventario: { [Op.in]: idInventarios } } });
  const idProductos = productos.map(producto => producto.id);
  const alertas = await AlertaPrecio.findAll({ where: { idProducto: { [Op.in]: idProductos } } });
  return alertas;
}


async function obtenerUsuario(idUsuario){
  const usuario = await Usuario.findByPk(idUsuario);
  return usuario;
}

async function marcarAlerta(idAlerta){
  const alerta = await AlertaPrecio.findByPk(idAlerta);
  if(alerta){
    alerta.lanzada = true;
    await alerta.save();
  }
}

async function obtenerUsuarioPorAlerta(idAlerta){
  const alerta = await AlertaPrecio.findByPk(idAlerta);
  if(alerta){
    const producto = await Producto.findByPk(alerta.idProducto);
    const inventario = await Inventario.findByPk(producto.idInventario);
    const usuario = await Usuario.findByPk(inventario.idUsuario);
    return usuario;
  }
}


module.exports = { Producto, sequelize, urlsProductos, HistorialPrecios, AlertaPrecio, Inventario, Usuario, zapatillasWebs, createProducto, createUsuario, createInventario, devolverproductoId, devolverproductos, actualizaPrecioProducto, agregaEnlacesProducto, eligeWebsZapatilla, obtenerUrlsProducto, obtenerWebsElegidas, modificaSelector, devuelveInventarios, iniciarSesion, eliminarUsuario, modificarUsuario, obtenerProductos, eliminarProducto, editarInventario, editarProducto, eliminarUrl, obtenerPreciosProducto, crearAlertaPrecio, eliminaAlertaPrecio, editarAlertaPrecio, obtenerAlerta, precioActualProducto, eliminarInventario, buscarProductos, obtenerAlertas, tipoInventario, obtenerUsuario, obtenerAlertasUsuario, marcarAlerta, obtenerUsuarioPorAlerta };

