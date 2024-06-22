import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


Modal.setAppElement('#root');



async function eliminarUsuario(idUsuario, contrasena) {
    const response = await fetch(`http://localhost:1234/api/eliminarUsuario`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: idUsuario, contrasena }),
    });

    if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(responseBody.error);
    }

    return response;
}

async function modificarUsuario(id, nombre, email, contrasenaNueva, contrasena) {
    const response = await fetch(`http://localhost:1234/api/modificarUsuario`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, nombre, email, contrasenaNueva, contrasena }),
    });

    if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(responseBody.error);
    }

    const usuarioActualizado = await response.json();
    return usuarioActualizado;

}

function cerrarSesion() {
    localStorage.removeItem('usuario');
}

function Cuenta({ usuario, setUsuario }) {
    const navigate = useNavigate();
    const [datosNuevos, setDatosNuevos] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [errorModal, setErrorModal] = useState(null);
    const [usuarioCompleto, setUsuarioCompleto] = useState({});

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setErrorModal(null);
    };

    const handleEliminar = async () => {
        try {
            await eliminarUsuario(usuario, password);
            cerrarSesion();
            setUsuario(null);
            navigate('/');
            closeModal();
        } catch (err) {
            setErrorModal(err.message);
            console.error(err);
        }
    }

    const handleModificar = async (event) => {
        event.preventDefault();
        if (!usuario) {
            console.error('Usuario no definido');
            return;
        }

        try {
            const { nombre, email, contrasenaNueva, contrasena } = datosNuevos;
            let id = usuario;
            const usuarioModificado = await modificarUsuario(id, nombre, email, contrasenaNueva, contrasena);
            setUsuario(usuarioModificado.id);
            navigate('/');
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    }

    const handleChange = (event) => {
        setDatosNuevos({
            ...datosNuevos,
            [event.target.name]: event.target.value
        });
    }

    useEffect(() => {
        async function obtenerUsuario(idUsuario){
            const response = await fetch(`http://localhost:1234/api/obtenerUsuario?id=${idUsuario}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const responseBody = await response.json();
                throw new Error(responseBody.error);
            }

            const usuario = await response.json();
            setUsuarioCompleto(usuario);
        }
        if (!usuario) {
            navigate('/iniciar-sesion');
        }
        else{
            obtenerUsuario(usuario);
        }
    }
    , [usuario]);

    return (
        <div>
            <Container maxWidth="sm">
                <Box mt={4}>
                    <form onSubmit={handleModificar}>
                        <TextField name="nombre" onChange={handleChange} placeholder={usuarioCompleto.nombre} fullWidth margin="normal" />
                        <TextField name="email" onChange={handleChange} placeholder={usuarioCompleto.email} fullWidth margin="normal" />
                        <TextField type="password" name="contrasenaNueva" onChange={handleChange} placeholder="Nueva contraseña" fullWidth margin="normal" />
                        <TextField type="password" name="contrasena" onChange={handleChange} placeholder="Contraseña actual" fullWidth margin="normal" />
                        <Button type="submit" disabled={!datosNuevos.contrasena} variant="contained" color="primary" fullWidth style={{ marginTop: '20px'}}>Modificar cuenta</Button>
                    </form>
                </Box>
                <Box mt={1}>
                    <Button variant="contained" style={{backgroundColor: 'red'}} fullWidth onClick={openModal}>Eliminar cuenta</Button>
                </Box>
                {error && <Alert severity="error">{error}</Alert>}
            </Container>
            <Dialog open={modalIsOpen} onClose={closeModal}>
                <DialogTitle>Eliminar cuenta</DialogTitle>
                <DialogContent>
                    <p>Introduce tu contraseña para eliminar la cuenta</p>
                    {errorModal && <Alert severity="error">{errorModal}</Alert>}
                    <TextField type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEliminar} color="primary">Eliminar</Button>
                    <Button onClick={closeModal} color="primary">Cancelar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Cuenta;