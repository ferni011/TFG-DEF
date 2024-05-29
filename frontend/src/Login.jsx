import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

async function iniciarSesion(email, contrasena) {
    const response = await fetch('http://localhost:1234/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, contrasena })
    });

    if (!response.ok) {
        throw new Error("Error al iniciar sesión");
    }

    const data = await response.json();
    return data;
}


function Login({ setUsuario }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");


    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const usuario = await iniciarSesion(email, contrasena);
            setUsuario(usuario);
            navigate('/');

        } catch (err) {
            console.error(err);
        }
    }

    return (
            <form onSubmit={handleLogin}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Contraseña:
                    <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                </label>
                <button type="submit">Iniciar sesión</button>
                <button type="button" onClick={() => navigate('/registro')}>Registrarse</button>
            </form>
    );

}

export default Login;