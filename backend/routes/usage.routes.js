const express = require('express');
const Usage = require('../models/Usage');
const Product = require('../models/Product');
const verifyToken = require('../middleware/verifyToken');
const { convertToCommonUnit } = require('../utils/conversion');
const router = express.Router();

// Crear un registro de uso
router.post('/register', verifyToken, async (req, res) => {
    const { product: productId, amount, unit, lots, totalArea, crop, user, date } = req.body;
    
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const convertedAmount = convertToCommonUnit(amount, unit, product);

        if (product.availableQuantity < convertedAmount) {
            return res.status(400).json({ message: 'Cantidad insuficiente en stock' });
        }

        const usage = new Usage({
            product: productId,
            amount: convertedAmount,
            date: date || new Date(),
            lots,
            totalArea,
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
    const { page = 1, limit = 10 } = req.query; // Paginado
    const skip = (page - 1) * limit; // Calcular el número de registros a saltar

    try {
        const totalUsages = await Usage.countDocuments({ isDisabled: false }); // Contar total de registros
        const usages = await Usage.find({ isDisabled: false }).populate('product').skip(skip).limit(limit); // Aplicar paginado

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
    const { product: productId, amount, unit, lots, totalArea, crop, user, notes, date } = req.body;

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
        usage.crop = crop || usage.crop;
        usage.user = user || usage.user;
        usage.notes = notes || usage.notes;

        // Guarda el registro actualizado
        await usage.save();

        res.json({ message: 'Registro de uso actualizado', usage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Deshabilitar un registro de uso
router.patch('/disable/:id', verifyToken, async (req, res) => {
    try {
        const disabledUsage = await Usage.findByIdAndUpdate(
            req.params.id,
            { isDisabled: true }, // Cambiar el estado a deshabilitado
            { new: true }
        );

        if (!disabledUsage) return res.status(404).json({ message: 'Registro de uso no encontrado' });
        res.json({ message: 'Registro de uso deshabilitado', disabledUsage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;