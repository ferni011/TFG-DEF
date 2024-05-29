import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

const Detalles = () => {
    const { idProducto } = useParams();
    const [producto, setProducto] = useState(null);
    const [precioObtenido, setPrecioObtenido] = useState(null);
    const [editando, setEditando] = useState(false);
    const [tituloEditado, setTituloEditado] = useState('');
    const [descripcionEditada, setDescripcionEditada] = useState('');
    const [imagenEditada, setImagenEditada] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        console.log("EL id es:" + idProducto);
        fetch(`http://localhost:1234/api/producto/${idProducto}`).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error al obtener producto');
        }).then(data => {
            setProducto(data);
        }).catch(error => {
            console.error(error);
        });
    }, [idProducto]);

    const handleGetProductPrice = async () => {
        if (!idProducto) {
            console.error('idProducto no está definido');
            console.log("EL ID DEL PRODUCTO" + idProducto);
            return;
        }
        const response = await fetch(`http://localhost:1234/api/precioProducto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: idProducto })
        }).catch(error => {
            console.error(error);
        });

        if (!response.ok) {
            throw new Error('Error al obtener precio de producto');
        }

        const data = await response.json();
        console.log(data.precioMinimo);
        setPrecioObtenido(data.precioMinimo);
    };

    const handleEdit = () => {
        setEditando(true);
        setTituloEditado(producto.nombre);
        setDescripcionEditada(producto.descripcion);
        setImagenEditada(producto.imagen);
    };

    const handleSave = async () => {
        const productoEditado = {
            ...producto,
            nombre: tituloEditado,
            descripcion: descripcionEditada,
            imagen: imagenEditada
        };

        const response = await fetch(`http://localhost:1234/api/modificarProducto`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: idProducto, ...productoEditado }),
        });

        if (response.ok) {
            setProducto(productoEditado);
            setEditando(false);
        } else {
            console.error('Error al guardar el producto: ', response.statusText);
        }
    }

    const handleDelete = async () => {
        const response = await fetch(`http://localhost:1234/api/eliminarProducto?id=${idProducto}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            setProducto(null);
            navigate(`/productos/${producto.idInventario}`);
        } else {
            console.error('Error al eliminar el producto: ', response.statusText);
        }
    };

    return (
        <div>
            {producto ? (
                <>
                    {editando ? (
                        <>
                            <input type="text" value={tituloEditado} onChange={e => setTituloEditado(e.target.value)} />
                            <textarea value={descripcionEditada} onChange={e => setDescripcionEditada(e.target.value)} />
                            <input type="text" value={imagenEditada} onChange={e => setImagenEditada(e.target.value)} />
                            <button onClick={handleSave}>Guardar</button>
                        </>
                    ) : (
                        <>
                            <h1>{producto.nombre}</h1>
                            {producto.imagen && <img src={producto.imagen} alt={producto.nombre} />}
                            <p>{producto.descripcion}</p>
                            <p>Precio: {precioObtenido !== null ? precioObtenido : producto.precio}</p>
                            <button onClick={handleEdit}>Editar</button>
                            <button onClick={handleDelete}>Eliminar</button> {/* Nuevo botón */}
                            <button><Link to={`/historialPrecios/${idProducto}`}>Historial de precios</Link></button>
                            <button onClick={handleGetProductPrice}>Obtener precio de producto</button>
                        </>
                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Detalles;