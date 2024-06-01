import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import ActionAreaCard from './ActionAreaCard';
import { Checkbox } from '@mui/material';


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
    const [page, setPage] = useState(1);
    const itemsPerPage = 9;
    const [tituloInventarioModalOpen, setTituloInventarioModalOpen] = useState(false);
    const navigate = useNavigate();


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
            else {
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

        await handleDeleteProducts();
        setTituloInventarioModalOpen(false);
    }

    const handlePageChange = (event, value) => {
        setPage(value);
    }

    const handleEditInventory = () => {
        setModoEdicion(true);
        setTituloInventario(inventarioActual.nombre);
    }

    const handleOpenTituloInventarioModal = () => {
        setTituloInventario(inventarioActual.nombre);
        setTituloInventarioModalOpen(true);
    }

    const handleCloseTituloInventarioModal = () => {
        setTituloInventarioModalOpen(false);
    }

    const handleDeleteInventory = async () => {
        const response = await fetch(`http://localhost:1234/api/eliminarInventario?id=${inventarioActual.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar inventario');
        }

        setProductos([]);
        setModoEdicion(false);
        navigate('/inventarios');
    }


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <h1>{tituloInventario}</h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={4} style={{ justifyContent: 'space-around', marginTop: '20px', maxWidth: '90%' }}>
                    {productos.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(producto => (
                        <Grid item xs={12} sm={6} md={4} key={producto.id}>
                            <div style={{ position: 'relative' }}>
                                <ActionAreaCard product={producto} />
                                {modoEdicion && (
                                    <Checkbox
                                        style={{ position: 'absolute', top: 0, right: 0 }}
                                        checked={selectedProducts.includes(producto.id)}
                                        onChange={() => handleSelectProduct(producto.id)}
                                    />
                                )}
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <Button variant="contained" color="primary" onClick={() => setModalIsOpen(true)}>Añadir producto</Button>
                {!modoEdicion ? (
                    <>
                    <Button variant="contained" color="primary" onClick={handleEditInventory} style={{ marginLeft: '10px' }}>Editar inventario</Button>
                    <Button variant="contained" onClick={handleDeleteInventory}  style={{ backgroundColor: '#f44336', color: 'white', marginLeft: '10px' }}>Eliminar inventario</Button>
                    </>
                ) : (
                    <>
                        <Button variant="contained" color="primary" onClick={handleOpenTituloInventarioModal} style={{ marginLeft: '10px' }}>Editar título del inventario</Button>
                        <Button variant="contained" style={{ backgroundColor: '#f44336', color: 'white', marginLeft: '10px' }} onClick={handleDeleteProducts}>Eliminar productos seleccionados</Button>
                        <Button variant="contained" style={{ backgroundColor: '#f44336', color: 'white', marginLeft: '10px' }} onClick={() => setModoEdicion(false)}>Cancelar edición</Button>
                    </>
                )}
            </div>
            <Dialog open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <DialogTitle>Añadir producto</DialogTitle>
                <DialogContent>
                    <TextField type="text" placeholder="Nombre" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} fullWidth />
                    <TextField type="text" placeholder="Descripción" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} fullWidth />
                    <TextField type="text" placeholder="Imagen URL" value={nuevoProducto.imagen} onChange={e => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddProducto} color="primary">Confirmar</Button>
                    <Button onClick={() => setModalIsOpen(false)} color="primary">Cancelar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={tituloInventarioModalOpen} onClose={handleCloseTituloInventarioModal}>
                <DialogTitle>Editar título del inventario</DialogTitle>
                <DialogContent style={{ paddingTop: '10px' }}>
                    <TextField
                        label="Título del inventario"
                        value={tituloInventario}
                        onChange={handleTituloInventario}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFinalizarEdicion} color="primary">Guardar</Button>
                    <Button onClick={handleCloseTituloInventarioModal} color="primary">Cancelar</Button>
                </DialogActions>
            </Dialog>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '20px' }}>
                <Pagination count={Math.ceil(productos.length / itemsPerPage)} page={page} onChange={handlePageChange} />
            </div>
        </div>
    );

}

export default Productos;