import React, { useState, useEffect } from 'react';
import { Grid, Box, TextField, Button, FormControlLabel, Radio, RadioGroup, Typography, Card, CardMedia, Alert, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Importa el ícono de flecha hacia atrás


const AlertaProducto = () => {
    const { idProducto } = useParams();
    const [producto, setProducto] = useState(null);
    const [precio, setPrecio] = useState('');
    const [superior, setSuperior] = useState('');
    const [alerta, setAlerta] = useState(null);
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState({ severity: "success", message: "" });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducto = async () => {
            const response = await fetch(`http://localhost:1234/api/obtenerProducto?id=${idProducto}`);
            const data = await response.json();
            setProducto(data);
        };

        const fetchAlerta = async () => {
            const response = await fetch(`http://localhost:1234/api/obtenerAlerta?id=${idProducto}`);
            const data = await response.json();
            setAlerta(data);

            if (data) {
                setPrecio(data.precio);
                setSuperior(data.superior);
            }

        };

        fetchProducto();
        fetchAlerta();
    }, [idProducto]);

    const handleCrearAlerta = async (event) => {
        event.preventDefault();

        try {
            await fetch('http://localhost:1234/api/crearAlertaPrecio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idProducto, precio, superior }),
            });

            navigate(`/detalles/${idProducto}`);
        } catch (error) {
            console.error(error);
            setAlert({ severity: "error", message: "Ocurrió un error al crear la alerta" });
            setOpen(true);
        }
    };

    const handleModificarAlerta = async (event) => {
        event.preventDefault();
        try {
            await fetch('http://localhost:1234/api/modificarAlertaPrecio', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: idProducto, precio, superior }),
            });

            setAlert({ severity: "success", message: "Alerta modificada" });
            setOpen(true);
        } catch (error) {
            console.error(error);
            setAlert({ severity: "error", message: "Ocurrió un error al modificar la alerta" });
            setOpen(true);
        }
    };

    const handleEliminarAlerta = async (event) => {
        event.preventDefault();
        try {
            await fetch(`http://localhost:1234/api/eliminarAlertaPrecio?id=${idProducto}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            navigate(`/detalles/${idProducto}`);
        }
        catch (error) {
            console.error(error);
            setAlert({ severity: "error", message: "Ocurrió un error al eliminar la alerta" });
            setOpen(true);
        }
    };


    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} style={{ margin: '10px' }}>
                    Volver
                </Button>
            </Grid>
            <Grid item xs={6}>
                <Box mt={5} ml={10}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="550"
                            image={producto ? producto.imagen : ''}
                            alt={producto ? producto.nombre : ''}
                            style={{ objectFit: 'contain' }}
                        />
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={6}>
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="90vh" mr={5}>
                    <Box>
                        <Typography variant="h3" align="center">{producto ? producto.nombre : ''}</Typography>
                    </Box>
                    <Box component="form" onSubmit={alerta ? handleModificarAlerta : handleCrearAlerta} mt={3}>
                        <TextField
                            type='text'
                            label="Precio objetivo"
                            value={precio}
                            onChange={(event) => {
                                const value = event.target.value.replace(',', '.');
                                const regex = /^\d*\.?\d*$/;
                                if (regex.test(value)) {
                                    setPrecio(value);
                                }
                            }}
                            required
                            fullWidth
                        />
                        <RadioGroup
                            row
                            value={superior ? "superior" : "inferior"}
                            onChange={(event) => setSuperior(event.target.value === 'superior')}
                            mt={3}
                            style={{ justifyContent: 'center' }}
                        >
                            <FormControlLabel value="inferior" control={<Radio />} label="Inferior" />
                            <FormControlLabel value="superior" control={<Radio />} label="Superior" />
                        </RadioGroup>
                        <Box mt={3} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button type="submit" variant="contained" color="primary">
                                {alerta ? 'Modificar alerta' : 'Crear alerta'}
                            </Button>
                            {alerta && (
                                <Button
                                    type="button"
                                    variant="contained"
                                    style={{ backgroundColor: 'red', marginLeft: '10px' }}
                                    onClick={handleEliminarAlerta}
                                >
                                    Eliminar alerta
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Grid>
            <Snackbar open={open} autoHideDuration={2000} onClose={() => setOpen(false)}>
                <Alert onClose={() => setOpen(false)} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default AlertaProducto;