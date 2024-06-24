import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Registro from './Registro';
import Cuenta from './Cuenta';
import Inventarios from './Inventario';
import Productos from './Productos';
import Detalles from './Detalles';
import Historial from './Historial';
import ResponsiveAppBar from './ResponsiveAppBar';
import Resultados from './Resultados';
import AlertaProducto from './AlertaProducto';
import Zapatillas from './Zapatillas';
import Alertas from './Alertas';

function App() {

    const [usuario, setUsuario] = useState(null);
    const [inventarioActual, setInventarioActual] = useState(null);

    useEffect(() => {
        const lanzarAlertas = async () => {
            const response = await fetch(`http://localhost:1234/api/ejecutaAlertas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Error al ejecutar las alertas');
            }
        };

        lanzarAlertas();
    }, []);


    return (
        <Router>
            <ResponsiveAppBar usuario={usuario} setUsuario={setUsuario} />
            <Routes>
                <Route path="/" element={<Navigate to="/inicio" />} />
                <Route path="/inicio" element={usuario ? <Navigate to="/inventarios" /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/iniciar-sesion" element={<Login setUsuario={setUsuario} />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cuenta" element={usuario ? <Cuenta usuario={usuario} setUsuario={setUsuario} /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/inventarios" element={usuario ? <Inventarios usuario={usuario} setInventarioActual={setInventarioActual} /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/productos/:idInventario" element={usuario ? <Productos usuario={usuario} inventarioActual={inventarioActual} /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/zapatillas/" element={usuario ? <Zapatillas usuario={usuario} setInventarioActual={setInventarioActual}/> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/zapatillas/:idInventario" element={usuario ? <Productos usuario={usuario} inventarioActual={inventarioActual} /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/detalles/:idProducto" element={usuario ? <Detalles /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/historialPrecios/:idProducto" element={usuario ? <Historial /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/resultados" element={usuario ? <Resultados /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/alertaProducto/:idProducto" element={usuario ? <AlertaProducto /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/alertas" element={usuario ? <Alertas usuario={usuario} /> : <Navigate to="/iniciar-sesion" /> } />
            </Routes>
        </Router>
    );

}

export default App;