// servidor del backend donde se hacen los manejos de rutas para cada componente
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// usamos cors para no tener problemas en el frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(express.json());

// nos conectamos con la base de datos
mongoose.connect(process.env.BDMONGO)
.then(() => console.log('Conectado a la base de datos.'))
.catch(error => console.error('Error conectando a la base de datos:', error));

// buscamos los ruteos con sus rutas respectivas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const usageRoutes = require('./routes/usage.routes');
const lotRoutes = require('./routes/lot.routes');
const iaRoutes = require('./routes/ia.routes');

// hacemos app use con cada una
app.use('/api/products', productRoutes);
app.use('/api/usages', usageRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ia', iaRoutes);

// levantamos servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));