import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

async function registrar(nombre, email, contrasena) {
    const response = await fetch('http://localhost:1234/api/usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, contrasena })
    });

    if (!response.ok) {
        throw new Error("Error al registrarse");
    }

    const data = await response.json();
    return data;
}

function Registro() {
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");

    const handleRegistro = async (event) => {
        event.preventDefault();
        try {
            const usuario = await registrar(nombre, email, contrasena);
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <form onSubmit={handleRegistro}>
            <label>
                Nombre:
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
                Email:
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
                Contraseña:
                <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
            </label>
            <button type="submit">Registrarse</button>
        </form>
    );
}

export default Registro;