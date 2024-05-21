// productos.js
const { Sequelize, DataTypes } = require('sequelize');

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
  }
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

      const usuario = await Usuario.create({
        nombre: nombre,
        email: email,
        contrasena: contrasena
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


async function createProducto(nombre, descripcion, imagen, SKU, talla, zapatilla, idInventario) {
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


      const producto = await Producto.create({
        nombre: nombre,
        descripcion: descripcion,
        imagen: imagen,
        SKU: SKU,
        talla: talla,
        zapatilla: zapatilla,
        idInventario: idInventario
      });
      if (zapatilla) {
        await zapatillasWebs.create({
          idProducto: producto.id,
          klekt: false,
          hypeboost: false,
          laced: false
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
        await producto.save();
        HistorialPrecios.create({
          precio: precioTienda,
          tienda: tienda,
          idProducto: id
        });
        console.log(`Precio ${tienda} actualizado a ${precioTienda}`); // Agrega esta línea
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
    if(!urlEncontrada){
      throw new Error('No existe la url con el id proporcionado');
    }else{
      await urlsProductos.update({ selector: selector }, { where: { id: urlEncontrada.dataValues.id } });
    }

}

async function encuentraURL(url) {
  const urls = urlsProductos.findOne({ where: { url: url } });
  return urls;
}


module.exports = { Producto, sequelize, urlsProductos, HistorialPrecios, AlertaPrecio, Inventario, Usuario, zapatillasWebs, createProducto, createUsuario, createInventario, devolverproductoId, devolverproductos, actualizaPrecioProducto, agregaEnlacesProducto, eligeWebsZapatilla, obtenerUrlsProducto, obtenerWebsElegidas, modificaSelector };
