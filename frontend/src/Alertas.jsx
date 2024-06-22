import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ButtonBase from '@mui/material/ButtonBase';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Importa el ícono de flecha hacia atrás


export default function Alertas({ usuario }) {

    const navigate = useNavigate();
    const [alertas, setAlertas] = useState([]);


    useEffect(() => {
        async function obtenerAlertas(idUsuario) {
            const response = await fetch(`http://localhost:1234/api/obtenerAlertasUsuario?idUsuario=${idUsuario}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const responseBody = await response.json();
                throw new Error(responseBody.error);
            }

            const alertasUsuario = await response.json();
            setAlertas(alertasUsuario);
        }

        obtenerAlertas(usuario);
    }
        , [usuario]);


    const handleClick = (alert) => {
        navigate(`/alertaProducto/${alert.idProducto}`)
    };

    return (
        
        <Container maxWidth="sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <Typography variant="h3" component="h1" mb={4} style={{ fontWeight: "bold" }}>
                Mis Alertas 🔔
            </Typography>
            <Box mr={10}>
                {alertas.length === 0 ? (
                    <Typography variant="h5" component="h2" mt={2} ml={4}>
                        No hay alertas creadas
                    </Typography>
                ) : (
                    <>
                        <Typography variant="body1" ml={34} mb={2} textAlign="center">
                            Alertas cumplidas
                        </Typography>
                        <List>
                            {alertas.map((alert) => (
                                <ListItem key={alert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <ButtonBase
                                        style={{
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '20px',
                                            marginRight: '2vw'
                                        }}
                                        onClick={() => handleClick(alert)}
                                    >
                                        <ListItemAvatar>
                                            <NotificationsIcon style={{ color: 'gold' }} />
                                        </ListItemAvatar>

                                        <ListItemText
                                            sx={{ mr: 3 }}
                                            primary={
                                                <>
                                                    Alerta del producto
                                                    <Typography variant="body1" component="span" fontWeight="bold">
                                                        {` ${alert.idProducto}`}
                                                    </Typography>
                                                </>
                                            } />
                                    </ButtonBase>
                                    <Checkbox
                                        edge="end"
                                        disabled={true}
                                        checked={alert.lanzada}
                                        sx={{
                                            '&.Mui-checked': {
                                                color: 'green',
                                            },
                                            marginRight: '1.5vw'
                                        }}
                                        style={{ marginBottom: '20px' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </Box>
        </Container>
    );
}