import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from 'react-modal';

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

    return response;

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

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setError(null);
    };

    const handleEliminar = async () => {
            try {
                await eliminarUsuario(usuario, password);
                cerrarSesion();
                setUsuario(null);
                navigate('/');
                closeModal();
            } catch (err) {
                setError(err.message);
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
            setUsuario(usuarioModificado);
        } catch (err) {
            console.error(err);
        }
    }

    const handleChange = (event) => {
        setDatosNuevos({
            ...datosNuevos,
            [event.target.name]: event.target.value
        });
    }

    return (
        <div>
            <button onClick={openModal}>Eliminar cuenta</button>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Eliminar cuenta"
            >
                <h2>Eliminar cuenta</h2>
                <p>Introduce tu contraseña para eliminar la cuenta</p>
                {error && <p>{error}</p>}
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={handleEliminar}>Confirmar eliminación</button>
                <button onClick={closeModal}>Cancelar</button>
            </Modal>
            <form onSubmit={handleModificar}>
                <input name="nombre" onChange={handleChange} placeholder="Nuevo nombre" />
                <input name="email" onChange={handleChange} placeholder="Nuevo email" />
                <input type="password" name="contrasenaNueva" onChange={handleChange} placeholder="Nueva contraseña" />
                <input type="password" name="contrasena" onChange={handleChange} placeholder="Contraseña actual" />
                <button type="submit" disabled={!datosNuevos.contrasena}>Modificar cuenta</button>
            </form>
        </div>
    );
}

export default Cuenta;