import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Pagination from '@mui/material/Pagination';



function Zapatillas({ usuario, setInventarioActual }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [inventarios, setInventarios] = useState([]);
    const [nuevoInventario, setNuevoInventario] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 9;



    useEffect(() => {
        fetch(`http://localhost:1234/api/inventariosZapatillas?idUsuario=${usuario}`).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error al obtener inventarios');
        }).then(data => {
            setInventarios(data);
        }).catch(error => {
            console.error(error);
        });

    }, [usuario]);

    const handleAddInventario = async () => {
        const response = await fetch('http://localhost:1234/api/inventario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idUsuario: usuario, nombre: nuevoInventario, esProducto: false })
        });

        if (!response.ok) {
            throw new Error('Error al añadir inventario');
        }

        const data = await response.json();
        setInventarios([...inventarios, data]);


        setModalIsOpen(false);
        setNuevoInventario('');
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <div>
            {inventarios.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Button variant="contained" color="primary" onClick={() => setModalIsOpen(true)}>Añadir inventario</Button>
                </div>
            ) : (
                <>
                <Grid container spacing={6} style={{ justifyContent: 'center', marginTop: '20px' }}>
                    {inventarios.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(inventario => (
                        <Grid item xs={12} sm={6} md={4} key={inventario.id}>
                            <Card>
                                <CardContent>
                                    <h2>{inventario.nombre}</h2>
                                    <Link to={`/productos/${inventario.id}`} onClick={() => setInventarioActual(inventario)}>Ver productos</Link>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Button variant="contained" color="primary" onClick={() => setModalIsOpen(true)}>Añadir inventario</Button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Pagination count={Math.ceil(inventarios.length / itemsPerPage)} page={page} onChange={handlePageChange} />
                </div>
            </>
            )}
            <Dialog open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <DialogTitle>Añadir inventario</DialogTitle>
                <DialogContent>
                    <TextField type="text" value={nuevoInventario} onChange={e => setNuevoInventario(e.target.value)} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddInventario} color="primary">Confirmar</Button>
                    <Button onClick={() => setModalIsOpen(false)} color="primary">Cancelar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Zapatillas;