import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';

Modal.setAppElement('#root'); // Esto es necesario para la accesibilidad

function Inventarios({ usuario, setInventarioActual }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [inventarios, setInventarios] = useState([]);
    const [nuevoInventario, setNuevoInventario] = useState('');

    useEffect(() => {
        fetch(`http://localhost:1234/api/inventarios?idUsuario=${usuario}`).then(response => {
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
        // Aquí debes enviar el nuevo inventario al servidor
        // y luego actualizar el estado `inventarios`

        const response = await fetch('http://localhost:1234/api/inventario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idUsuario: usuario, nombre: nuevoInventario, esProducto: true })
        });

        if (!response.ok) {
            throw new Error('Error al añadir inventario');
        }

        const data = await response.json();
        setInventarios([...inventarios, data]);

        setModalIsOpen(false);
        setNuevoInventario('');
    };

    return (
        <div>
            <button onClick={() => setModalIsOpen(true)}>Añadir inventario</button>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Añadir inventario"
            >
                <h2>Añadir inventario</h2>
                <input type="text" value={nuevoInventario} onChange={e => setNuevoInventario(e.target.value)} />
                <button onClick={handleAddInventario}>Confirmar</button>
                <button onClick={() => setModalIsOpen(false)}>Cancelar</button>
            </Modal>
            <ul>
            {inventarios.map(inventario => (
                <div key={inventario.id}>
                    <h2>{inventario.nombre}</h2>
                    <Link to={`/productos/${inventario.id}`} onClick={() => setInventarioActual(inventario)}>Ver productos</Link>
                </div>
            ))}
            </ul>
        </div>
    );
}

export default Inventarios;