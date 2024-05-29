import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Registro from './Registro';
import Cuenta from './Cuenta';
import Inventarios from './Inventario';
import Productos from './Productos';
import Detalles from './Detalles';
import Historial from './Historial';
import Prueba from './Prueba';

function App() {

    const [usuario, setUsuario] = useState(null);
    const [inventarioActual, setInventarioActual] = useState(null);

    return (
        <Router>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand as={Link} to="/">Mi Aplicación</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        {!usuario ? (
                            <Nav.Link as={Link} to="/iniciar-sesion">Iniciar sesión</Nav.Link>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                                <Nav.Link as={Link} to="/inventarios">Mis Inventarios</Nav.Link>
                                <Nav.Link as={Link} to="/cuenta">Mi Cuenta</Nav.Link>
                                <Nav.Link onClick={() => setUsuario(null)}>Cerrar sesión</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Routes>
                <Route path="/" element={usuario ? <Navigate to="/inventarios" /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/iniciar-sesion" element={<Login setUsuario={setUsuario} />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cuenta" element={usuario ? <Cuenta usuario={usuario} setUsuario={setUsuario} /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/inventarios" element={usuario ? <Inventarios usuario={usuario} setInventarioActual={setInventarioActual}/> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/productos/:idInventario" element={usuario ? <Productos usuario={usuario} inventarioActual={inventarioActual} /> : <Navigate to="/iniciar-sesion" /> } />
                <Route path="/detalles/:idProducto" element={usuario ? <Detalles /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/historialPrecios/:idProducto" element={usuario ? <Historial /> : <Navigate to="/iniciar-sesion" />} />
                <Route path="/prueba" element={<Prueba />} />
            </Routes>
        </Router>
    );

}

export default App;