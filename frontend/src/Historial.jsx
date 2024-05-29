import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const Historial = () => {
    const { idProducto } = useParams();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [urls, setUrls] = useState([]);
    const [existingUrls, setExistingUrls] = useState([]);
    const [precios, setPrecios] = useState([]);
    const [maximo, setMaximo] = useState(false);

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

    const preciosPorFecha = precios.reduce((acc, precio) => {
        const fecha = new Date(precio.createdAt).toLocaleString(); // Fecha y hora
        if (!acc[fecha]) {
            acc[fecha] = [];
        }
        acc[fecha].push(Number(precio.precio));
        return acc;
    }, {});


    const datosPrecios = Object.entries(preciosPorFecha).map(([fecha, preciosFecha]) => {
        console.log(preciosFecha);
        const precio = maximo ? Math.max(...preciosFecha) : Math.min(...preciosFecha);
        return { fecha, precio };
    });

    const labels = datosPrecios.map(dato => dato.fecha);
    const datos = datosPrecios.map(dato => dato.precio);

    const data = {
        labels: labels,
        datasets: [
            {
                label: "Historial de precios",
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
            <button onClick={handleOpenModal}>Añadir URLs</button>
            <Modal isOpen={modalIsOpen} onRequestClose={handleCloseModal}>
                <h2>Añadir URLs</h2>
                <form onSubmit={handleAddUrl}>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" required />
                    <button type="submit">Añadir a la lista</button>
                </form>
                <ul>
                    {existingUrls && existingUrls.map((url, index) => (
                        <li key={index}>
                            {url}
                            <button onClick={() => handleDeleteUrl(index)}>Eliminar</button>
                        </li>
                    ))}
                    {urls && urls.map((url, index) => (
                        <li key={index + (existingUrls ? existingUrls.length : 0)}>
                            {url}
                            <button onClick={() => handleDeleteNewUrl(index)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
                <button onClick={handleAddAllUrls}>Guardar Urls Nuevas</button>
            </Modal>
            <h2>Historial de precios</h2>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tienda</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
                    {precios && precios.map((precio, index) => (
                        <tr key={index}>
                            <td>{new Date(precio.createdAt).toLocaleString()}</td>
                            <td>{precio.tienda}</td>
                            <td>{precio.precio}</td>
                        </tr>
                    ))}
                    {precios.length === 0 && (
                        <tr>
                            <td colSpan="3">No hay precios registrados</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <h2>Gráfico de precios</h2>
            <Line data={data} options={options} />
        </div>
    );
}

export default Historial;