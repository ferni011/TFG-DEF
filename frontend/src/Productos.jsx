import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';

Modal.setAppElement('#root');

function Productos({ usuario, inventarioActual }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [productos, setProductos] = useState([]);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        descripcion: '',
        imagen: '',
        SKU: '',
        talla: ''
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloInventario, setTituloInventario] = useState(inventarioActual.nombre);

    useEffect(() => {
        if (!inventarioActual) {
            return;
        }

        fetch(`http://localhost:1234/api/productos?idInventario=${inventarioActual.id}`).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error al obtener productos');
        }).then(data => {
            setProductos(data);
        }).catch(error => {
            console.error(error);
        });

    }, [inventarioActual]);

    const handleAddProducto = async (event) => {
        event.preventDefault();

        let producto = { ...nuevoProducto, idInventario: inventarioActual.id };
        if (producto.talla === '') {
            producto.talla = null;
        }

        const response = await fetch('http://localhost:1234/api/producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            throw new Error('Error al añadir producto');
        }

        const data = await response.json();

        const responseProductos = await fetch(`http://localhost:1234/api/productos?idInventario=${inventarioActual.id}`);
        if (!responseProductos.ok) {
            throw new Error('Error al obtener productos');
        }

        const dataProductos = await responseProductos.json();
        setProductos(dataProductos);

        setModalIsOpen(false);
        setNuevoProducto({
            nombre: '',
            descripcion: '',
            imagen: '',
            SKU: '',
            talla: ''
        });
    }

    const handleSelectProduct = (id) => {
        setSelectedProducts(prevSelectedProducts => {
            if (prevSelectedProducts.includes(id)) {
                return prevSelectedProducts.filter(productId => productId !== id);
            }
            else{
                return [...prevSelectedProducts, id];
            }
        });
    }

    const handleDeleteProducts = async () => {
        for (let id of selectedProducts) {
            const response = await fetch(`http://localhost:1234/api/eliminarProducto?id=${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar producto');
            }
        }

        const responseProductos = await fetch(`http://localhost:1234/api/productos?idInventario=${inventarioActual.id}`);
        if (!responseProductos.ok) {
            throw new Error('Error al obtener productos');
        }

        const dataProductos = await responseProductos.json();
        setProductos(dataProductos);

        setSelectedProducts([]);
    }

    const handleTituloInventario = (event) => {
        setTituloInventario(event.target.value);
    }

    const handleFinalizarEdicion = async () => {
        const response = await fetch(`http://localhost:1234/api/modificarInventario`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: inventarioActual.id, nombre: tituloInventario })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar inventario');
        }

        setModoEdicion(false);
    }

    return (
        <div>
            {modoEdicion ? (
                <input type="text" value={tituloInventario} onChange={handleTituloInventario} />
            ) : (
                <h1>{tituloInventario}</h1>
            )}
            <button onClick={() => setModalIsOpen(true)}>Crear Producto</button>
            <button onClick={modoEdicion ? handleFinalizarEdicion : () => setModoEdicion(true)}>
                {modoEdicion ? 'Finalizar edición' : 'Editar'}
            </button>            
            {modoEdicion && <button onClick={handleDeleteProducts}>Eliminar Producto</button>}

            <Modal isOpen={modalIsOpen}>
                <h2>Crear Producto</h2>
                <form onSubmit={handleAddProducto}>
                    <input type="text" placeholder="Nombre" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} />
                    <input type="text" placeholder="Descripción" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} />
                    <input type="text" placeholder="Imagen URL" value={nuevoProducto.imagen} onChange={e => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })} />
                    <button type="submit">Crear</button>
                </form>
                <button onClick={() => setModalIsOpen(false)}>Cerrar</button>
            </Modal>
            <ul>
                {productos.map(producto => (
                    <li key={producto.id}>
                        {modoEdicion &&<input type="checkbox" onChange={() => handleSelectProduct(producto.id)} /> }
                        <h2>{producto.nombre}</h2>
                        {producto.imagen && <img src={producto.imagen} alt={producto.nombre} />}
                        <Link to={`/detalles/${producto.id}`}>Ver detalles</Link>
                    </li>
                ))}
            </ul>
        </div>
    );

}

export default Productos;