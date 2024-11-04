// manejo de rutas para el registro de usos

const express = require('express');
const Usage = require('../models/Usage');
const Product = require('../models/Product');
const verifyToken = require('../middleware/verifyToken');
// logica de conversion para las unidades
const { convertToCommonUnit } = require('../utils/conversion');
const router = express.Router();

// Crear un registro de uso
router.post('/register', verifyToken, async (req, res) => {
    const { product: productId, amount, unit, lots, totalArea, prevCrop, crop, user, date } = req.body;
    
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const convertedAmount = convertToCommonUnit(amount, unit, product);

        // control de cantidad disponible en producto seleccionado
        if (product.availableQuantity < convertedAmount) {
            return res.status(400).json({ message: 'Cantidad insuficiente en stock' });
        }

        const usage = new Usage({
            product: productId,
            amount: convertedAmount,
            date: date || new Date(),
            lots,
            totalArea,
            prevCrop,
            crop,
            user,
        });

        await usage.save();

        product.availableQuantity -= convertedAmount;
        await product.save();

        res.status(201).json(usage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Obtener todos los registros habilitados con paginado
router.get('/history', verifyToken, async (req, res) => {
    const { page = 1, limit = 10 } = req.query; 
    const skip = (page - 1) * limit; 

    try {
        const totalUsages = await Usage.countDocuments({ isDisabled: false }); 
        const usages = await Usage.find({ isDisabled: false }).populate('product').skip(skip).limit(limit); 

        res.json({
            totalUsages,
            usages,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Editar un registro de uso
router.patch('/edit/:id', verifyToken, async (req, res) => {
    const { product: productId, amount, unit, lots, totalArea, prevCrop, crop, user, date } = req.body;

    try {
        // Verifica que el registro existe
        const usage = await Usage.findById(req.params.id);

        if (!usage) {
            return res.status(404).json({ message: 'Registro de uso no encontrado' });
        }

        // Si se está cambiando el producto, puedes realizar la lógica para verificar stock
        if (productId) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            const convertedAmount = convertToCommonUnit(amount, unit, product);

            if (product.availableQuantity + usage.amount < convertedAmount) {
                return res.status(400).json({ message: 'Cantidad insuficiente en stock' });
            }
        }

        // Actualiza los campos
        usage.product = productId || usage.product;
        usage.amount = amount || usage.amount;
        usage.date = date || usage.date;
        usage.lots = lots || usage.lots;
        usage.totalArea = totalArea || usage.totalArea;
        usage.prevCrop = prevCrop || usage.prevCrop;
        usage.crop = crop || usage.crop;
        usage.user = user || usage.user;

        // Guarda el registro actualizado
        await usage.save();

        res.json({ message: 'Registro de uso actualizado', usage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener todos los registros habilitados con paginado
router.get('/disabled', verifyToken, async (req, res) => {
    const { page = 1, limit = 10 } = req.query; 
    const skip = (page - 1) * limit; 

    try {
        const totalUsages = await Usage.countDocuments({ isDisabled: true }); 
        const usages = await Usage.find({ isDisabled: true }).populate('product').skip(skip).limit(limit); 

        res.json({
            totalUsages,
            usages,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Deshabilitar un registro de uso
router.patch('/disable/:id', verifyToken, async (req, res) => {
    try {
        const disabledUsage = await Usage.findByIdAndUpdate(req.params.id,);
        if (!disabledUsage) return res.status(404).json({ message: 'Registro de uso no encontrado' });

        const product = await Product.findById(disabledUsage.product);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        product.availableQuantity += disabledUsage.amount;
        await product.save();

        disabledUsage.isDisabled = true;
        await disabledUsage.save();

        res.json({ message: 'Registro de uso deshabilitado y stock actualizado', disabledUsage });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Habilitar un registro de uso
router.patch('/enable/:id', verifyToken, async (req, res) => {
    try {
        const usage = await Usage.findById(req.params.id);
        if (!usage) return res.status(404).json({ message: 'Registro de uso no encontrado' });

        const product = await Product.findById(usage.product);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        // Verificar si hay suficiente stock disponible para restar
        if (product.availableQuantity < usage.amount) {
            return res.status(400).json({ message: 'Cantidad insuficiente en stock para habilitar el uso' });
        }

        // Restar la cantidad del uso del stock disponible del producto
        product.availableQuantity -= usage.amount;
        await product.save();

        // Marcar el uso como habilitado
        usage.isDisabled = false;
        await usage.save();

        res.json({ message: 'Registro de uso habilitado y stock actualizado', usage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;