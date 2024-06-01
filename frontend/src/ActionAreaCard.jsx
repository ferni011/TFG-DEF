import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

function ActionAreaCard({ product }) {
  return (
    <Link to={`/detalles/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <Card>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={product.imagen}
          alt={product.nombre}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.descripcion}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    </Link>
  );
}

export default ActionAreaCard;