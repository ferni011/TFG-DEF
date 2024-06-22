import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Grid, Box, Card, CardMedia, Button, Typography, TextField, CircularProgress } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';


const Detalles = () => {
    const { idProducto } = useParams();
    const [producto, setProducto] = useState(null);
    const [precioObtenido, setPrecioObtenido] = useState(null);
    const [editando, setEditando] = useState(false);
    const [tituloEditado, setTituloEditado] = useState('');
    const [descripcionEditada, setDescripcionEditada] = useState('');
    const [imagenEditada, setImagenEditada] = useState('');
    const [open, setOpen] = useState(false);
    const [valorSeleccionado, setValorSeleccionado] = useState('maximo');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        console.log("EL id es:" + idProducto);
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

    const handleGetProductPrice = async () => {
        setLoading(true);
        if (!idProducto) {
            console.error('idProducto no está definido');
            console.log("EL ID DEL PRODUCTO" + idProducto);
            return;
        }
        let response;
        try {
            response = await fetch(`http://localhost:1234/api/precioProducto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: idProducto })
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }


        if (!response.ok) {
            throw new Error('Error al obtener precio de producto');
        }

        const data = await response.json();
        console.log(data.precioMinimo);
        setPrecioObtenido(data.precioMinimo);
    };

    const handleGetZapatillaPrice = async () => {
        setLoading(true);
        if (!idProducto) {
            console.error('idProducto no está definido');
            console.log("EL ID DEL PRODUCTO" + idProducto);
            return;
        }
        let response;
        try {
            setLoading(true);
            response = await fetch(`http://localhost:1234/api/zapatillaPrecio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: idProducto })
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

        if (!response.ok) {
            throw new Error('Error al obtener precio de producto');
        }

        const data = await response.json();
        console.log(data.precioMax);
        setPrecioObtenido(data.precioMax);
    };


    const handleEdit = () => {
        setEditando(true);
        setTituloEditado(producto.nombre);
        setDescripcionEditada(producto.descripcion);
        setValorSeleccionado(producto.superior ? 'maximo' : 'minimo')
        setOpen(true)
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('id', idProducto);
        formData.append('nombre', tituloEditado);
        formData.append('descripcion', descripcionEditada);
        if (imagenEditada) {
            formData.append('imagen', imagenEditada, imagenEditada.name);
        }
        formData.append('superior', valorSeleccionado === 'maximo' ? '1' : '0');

        if (producto.zapatilla) {
            formData.append('SKU', producto.SKU);
            formData.append('talla', producto.talla);
        }

        const response = await fetch(`http://localhost:1234/api/modificarProducto`, {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            const message = await response.text();
            console.log(message);
            setEditando(false);
            setOpen(false);
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
                <div>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            {producto.imagen && (
                                <Box mt={3} ml={2}>
                                    <Card>
                                        <CardMedia
                                            component="img"
                                            height="550"
                                            image={producto.imagen}
                                            alt={producto.nombre}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </Card>
                                </Box>
                            )}
                            <Box mt={2} display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                                <Button variant="contained" color="primary" onClick={handleEdit} sx={{ mr: 2 }}><EditIcon /></Button>
                                <Button variant="contained" style={{ backgroundColor: 'red' }} onClick={handleDelete}><DeleteIcon /></Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                            <Typography variant="h3" align="center" mb={4}>
                                {producto.nombre}
                                <IconButton onClick={() => navigate(`/AlertaProducto/${idProducto}`)} style={{ marginLeft: '1vw' }}>
                                    <NotificationsIcon style={{ fontSize: '40px', color: 'gold' }} />
                                </IconButton>
                            </Typography>
                            <Typography variant="body1" align="center" mb={2}>{producto.descripcion}</Typography>
                            {producto.zapatilla && (
                                <>
                                    <Typography variant="body1" align="center" mb={2}>
                                        <span style={{ fontWeight: 'bold' }}>SKU:</span> {producto.SKU}
                                    </Typography>
                                    <Typography variant="body1" align="center" mb={2}>
                                        <span style={{ fontWeight: 'bold' }}>Talla:</span> {producto.talla}
                                    </Typography>
                                </>
                            )}
                            <Typography variant="body1" align="center">
                                <span style={{ fontWeight: 'bold' }}>Precio:</span> {precioObtenido !== null ? precioObtenido : producto.precio}
                            </Typography>                        <Box mt={2} display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                                <Box mt={2} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                    <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                                        <Button variant="contained" color="primary" onClick={() => navigate(`/historialPrecios/${idProducto}`)} sx={{ mr: 2 }}>
                                            Historial de precios
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={producto.zapatilla ? handleGetZapatillaPrice : handleGetProductPrice}>
                                            Obtener mejor precio de producto
                                        </Button>
                                    </Box>
                                    {loading && <Box mt={6}><CircularProgress /></Box>}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Editar Producto</DialogTitle>
                        <DialogContent>
                            <TextField label="Nombre" value={tituloEditado} onChange={e => setTituloEditado(e.target.value)} fullWidth sx={{ mt: 2 }} />
                            <TextField label="Descripción" value={descripcionEditada} onChange={e => setDescripcionEditada(e.target.value)} fullWidth sx={{ mt: 2 }} />

                            {producto.zapatilla && (
                                <>
                                    <TextField
                                        label="SKU"
                                        value={producto.SKU}
                                        onChange={(e) => setProducto({ ...producto, SKU: e.target.value })}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    />

                                    <TextField
                                        label="Talla"
                                        type="text"
                                        value={producto.talla}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (!value || /^\d*\.?\d*$/.test(value)) {
                                                setProducto({ ...producto, talla: value });
                                            }
                                        }}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    />
                                </>
                            )}
                            <FormControl component="fieldset">
                                <RadioGroup row aria-label="historial" name="row-radio-buttons-group" value={valorSeleccionado} onChange={(e) => setValorSeleccionado(e.target.value)}>
                                    <FormControlLabel value="maximo" control={<Radio />} label="Máximo" />
                                    <FormControlLabel value="minimo" control={<Radio />} label="Mínimo" />
                                </RadioGroup>
                            </FormControl>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={e => setImagenEditada(e.target.files[0])}
                            />
                            <label htmlFor="raised-button-file" style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color="primary" component="span" fullWidth sx={{ mt: 2 }}>
                                    Subir imagen
                                </Button>
                            </label>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancelar</Button>
                            <Button onClick={handleSave}>Guardar</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Editar Producto</DialogTitle>
                <DialogContent>
                    <TextField label="Nombre" value={tituloEditado} onChange={e => setTituloEditado(e.target.value)} fullWidth sx={{ mt: 2 }} />
                    <TextField label="Descripción" value={descripcionEditada} onChange={e => setDescripcionEditada(e.target.value)} fullWidth sx={{ mt: 2 }} />

                    {producto && producto.zapatilla && (
                        <>
                            <TextField
                                label="SKU"
                                value={producto.SKU}
                                onChange={(e) => setProducto({ ...producto, SKU: e.target.value })}
                                fullWidth
                                sx={{ mt: 2 }}
                            />

                            <TextField
                                label="Talla"
                                type="text"
                                value={producto.talla}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (!value || /^\d*\.?\d*$/.test(value)) {
                                        setProducto({ ...producto, talla: value });
                                    }
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                        </>
                    )}
                    <FormControl component="fieldset">
                        <RadioGroup row aria-label="historial" name="row-radio-buttons-group" value={valorSeleccionado} onChange={(e) => setValorSeleccionado(e.target.value)}>
                            <FormControlLabel value="maximo" control={<Radio />} label="Máximo" />
                            <FormControlLabel value="minimo" control={<Radio />} label="Mínimo" />
                        </RadioGroup>
                    </FormControl>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={e => setImagenEditada(e.target.files[0])}
                    />
                    <label htmlFor="raised-button-file" style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="contained" color="primary" component="span" fullWidth sx={{ mt: 2 }}>
                            Subir imagen
                        </Button>
                    </label>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Detalles;