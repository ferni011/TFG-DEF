import { useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import ActionAreaCard from './ActionAreaCard';
import Alert from '@mui/material/Alert';


function Resultados() {
    const location = useLocation();
    const productos = location.state.resultados;
    const [page, setPage] = useState(1);
    const itemsPerPage = 9;


    const handlePageChange = (event, value) => {
        setPage(value);
    }




    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <h1>Resultados de la búsqueda</h1>
            </div>
            {productos.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
                    <Alert severity="info">No se encontraron resultados</Alert>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={4} style={{ justifyContent: 'space-around', marginTop: '20px', maxWidth: '90%' }}>
                            {productos.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(producto => (
                                <Grid item xs={12} sm={6} md={4} key={producto.id}>
                                    <div style={{ position: 'relative' }}>
                                        <ActionAreaCard product={producto} />
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '20px' }}>
                        <Pagination count={Math.ceil(productos.length / itemsPerPage)} page={page} onChange={handlePageChange} />
                    </div>
                </>
            )}
        </div>
    );

}

export default Resultados;