// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    disableProduct
} = require('../controllers/product.controller');

const verifyToken = require('../middleware/verifyToken');

// Crear un producto
router.post('/create', verifyToken, createProduct);

// Obtener todos los productos
router.get('/inventory', verifyToken, getAllProducts);

// Obtener un producto por ID
router.get('/inventory/:id',verifyToken, getProductById);

// Actualizar un producto
router.put('/update/:id', verifyToken, updateProduct);

// Deshabilitar un producto
router.patch('/disable/:id', verifyToken, disableProduct);

module.exports = router;
