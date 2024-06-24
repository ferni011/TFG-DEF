import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Switch } from '@mui/material';


Chart.register(...registerables);

const Historial = () => {
    const { idProducto } = useParams();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [urls, setUrls] = useState([]);
    const [existingUrls, setExistingUrls] = useState([]);
    const [precios, setPrecios] = useState([]);
    const [maximo, setMaximo] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [producto, setProducto] = useState(null);
    const [ModalZapatillaOpen, setModalZapatillaOpen] = useState(false);
    const [tiendas, setTiendas] = useState({ klekt: false, hypeboost: false, laced: false });


    const preciosPorPagina = 12;
    const preciosPaginados = precios.slice((currentPage - 1) * preciosPorPagina, currentPage * preciosPorPagina);

    useEffect(() => {
        if (!modalIsOpen) {
            setUrls([]);
        }
    }, [modalIsOpen]);

    useEffect(() => {
        const obtenerPrecios = async () => {
            const response = await fetch(`http://localhost:1234/api/obtenerPreciosProducto?id=${idProducto}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener precios');
            }

            const data = await response.json();
            setPrecios(data);
        };

        obtenerPrecios();
    }, [idProducto]);

    useEffect(() => {
        fetch(`http://localhost:1234/api/obtenerProducto?id=${idProducto}`).then(response => {
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

    const handleOpenModal = async () => {
        const response = await fetch(`http://localhost:1234/api/obtenerEnlacesProducto?id=${idProducto}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener URLs');
        }

        const data = await response.json();
        setExistingUrls(data.map(item => item.url));
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
    };

    const handleOpenModalZapatillas = async () => {
        const response = await fetch(`http://localhost:1234/api/obtenerWebsElegidas?id=${idProducto}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener URLs');
        }

        const data = await response.json();
        const tiendas = {
            klekt: data.klekt,
            hypeboost: data.hypeboost,
            laced: data.laced
        };

        setTiendas(tiendas);
        setModalZapatillaOpen(true);
    };

    const handleCloseModalZapatillas = () => {
        setModalZapatillaOpen(false);
    };

    const handleAddUrl = (event) => {
        event.preventDefault();
        setUrls(prevUrls => [...prevUrls, url]);
        setUrl('');
    };

    const handleAddAllUrls = async () => {
        const response = await fetch(`http://localhost:1234/api/anadeEnlace`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: idProducto, enlaces: urls })
        });

        if (!response.ok) {
            throw new Error('Error al añadir URLs');
        }

        setExistingUrls(prevUrls => [...prevUrls, ...urls]);
        setUrls([]);
        setModalIsOpen(false);
    };

    const handleDeleteUrl = async (index) => {
        const urlToDelete = existingUrls[index];
        const response = await fetch(`http://localhost:1234/api/eliminarUrl`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idProducto: idProducto, url: urlToDelete })
        });

        if (!response.ok) {
            throw new Error('Error al eliminar URL');
        }

        setExistingUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    }

    const handleDeleteNewUrl = (index) => {
        setUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    }

    const handleSwitchChange = (tienda) => {
        setTiendas(prevTiendas => ({
            ...prevTiendas,
            [tienda]: !prevTiendas[tienda]
        }));
    };

    const handleSaveTiendas = async () => {
        const response = await fetch(`http://localhost:1234/api/eligeWebs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: idProducto, webs: tiendas })
        });

        if (!response.ok) {
            throw new Error('Error al guardar tiendas');
        }

        setModalZapatillaOpen(false);
    };

    const handleMaximo = () => {
        setMaximo(prevMaximo => !prevMaximo);
    };





    const preciosPorFecha = precios.reduce((acc, precio) => {
        const fecha = new Date(precio.createdAt).toLocaleString(); // Fecha y hora
        if (!acc[fecha]) {
            acc[fecha] = [];
        }
        acc[fecha].push(Number(precio.precio));
        return acc;
    }, {});




    const datosPrecios = Object.entries(preciosPorFecha).map(([fecha, preciosFecha]) => {
        const precio = maximo ? Math.max(...preciosFecha) : Math.min(...preciosFecha);
        return { fecha, precio };
    });



    const labels = datosPrecios.map(dato => dato.fecha);
    const datos = datosPrecios.map(dato => dato.precio);

    const data = {
        labels: labels,
        datasets: [
            {
                label: "Historial",
                data: datos,
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };


    const maxPrecio = Math.max(...precios.map(precio => Number(precio.precio)));


    const options = {
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: maxPrecio
            }
        }
    };


    return (
        <div>
            {producto && !producto.zapatilla ? (
                <Dialog open={modalIsOpen} onClose={handleCloseModal}>
                    <DialogTitle>Añadir URLs</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleAddUrl}>
                            <TextField
                                type="text"
                                value={url.length > 50 ? `${url.slice(0, 50)}...` : url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="URL"
                                required
                                fullWidth
                            />
                            <Button type="submit" color="primary" variant="contained" style={{ marginTop: '10px' }}>Añadir a la lista</Button>
                        </form>
                        <List>
                            {existingUrls && existingUrls.map((url, index) => (
                                <ListItem key={index}>
                                    {url.length > 50 ? `${url.slice(0, 50)}...` : url}
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteUrl(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                            {urls && urls.map((url, index) => (
                                <ListItem key={index + (existingUrls ? existingUrls.length : 0)}>
                                    {url.length > 50 ? `${url.slice(0, 50)}...` : url}
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNewUrl(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleAddAllUrls} color="primary" variant="contained">Guardar Urls Nuevas</Button>
                    </DialogActions>
                </Dialog>
            ) : (
                <Dialog open={ModalZapatillaOpen} onClose={handleCloseModalZapatillas}>
                    <DialogTitle>Añadir URLs</DialogTitle>
                    <DialogContent>
                        {Object.entries(tiendas).map(([tienda, valor], index) => (
                            <div key={index}>
                                <p>{tienda}:</p>
                                <Switch
                                    checked={valor}
                                    onChange={() => handleSwitchChange(tienda)}
                                    name={tienda}
                                    color="primary"
                                />
                            </div>
                        ))}
                        <DialogActions>
                            <Button onClick={handleSaveTiendas} color="primary" variant="contained">Guardar Tiendas Seleccionadas</Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>
            )}
            <Grid container spacing={3} style={{ marginTop: '10vh' }}>
                <Grid item xs={12} md={6}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Box display="flex" justifyContent="center" width="100%" ml={4} mr={2}>
                            <Line data={data} options={options} />
                        </Box>
                    </Box>
                    <Box display="flex" justifyContent="center" width="100%" ml={4} mr={2} mt={2}>
                        <Button variant="contained" color="primary" onClick={handleMaximo} alignItems="center">
                            {maximo ? 'Precio mínimo' : 'Precio máximo'}
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box mr={4}>
                        <table style={{ width: '100%', textAlign: 'center' }}>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tienda</th>
                                    <th>Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preciosPaginados && preciosPaginados.map((precio, index) => (
                                    <tr key={index}>
                                        <td>{new Date(precio.createdAt).toLocaleString()}</td>
                                        <td>
                                            {
                                                producto.zapatilla ?
                                                    (precio.tienda.length > 50 ? `${precio.tienda.slice(0, 50)}...` : precio.tienda) :
                                                    <a href={precio.tienda} target="_blank" rel="noopener noreferrer">
                                                        {precio.tienda.length > 50 ? `${precio.tienda.slice(0, 50)}...` : precio.tienda}
                                                    </a>
                                            }
                                        </td>
                                        <td>{precio.precio}€</td>
                                    </tr>
                                ))}
                                {precios.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ height: '40vh' }}>No hay precios registrados</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Box display="flex" justifyContent="center" mt={2}>
                            <Button disabled={currentPage === 1 || precios.length === 0} onClick={() => setCurrentPage(currentPage - 1)}>Página anterior</Button>
                            <Button disabled={currentPage === Math.ceil(precios.length / preciosPorPagina) || precios.length === 0} onClick={() => setCurrentPage(currentPage + 1)} style={{ marginLeft: '10px' }}>Página siguiente</Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box display="flex" justifyContent="center" mt={3}>
                <Button variant="contained" color="primary" onClick={producto && producto.zapatilla ? handleOpenModalZapatillas : handleOpenModal}>
                    {producto && producto.zapatilla ? 'Modificar webs elegidas' : 'Modificar enlaces del producto'}
                </Button>
            </Box>
        </div>
    );
}

export default Historial;
