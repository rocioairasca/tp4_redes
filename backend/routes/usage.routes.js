const express = require('express');
const Usage = require('../models/Usage');
const Product = require('../models/Product');
const verifyToken = require('../middleware/verifyToken');
const { convertToCommonUnit } = require('../utils/conversion');
const router = express.Router();

// Crear un registro de uso
router.post('/register', verifyToken, async (req, res) => {
    const { product: productId, amount, unit, lots, totalArea, crop, user, notes, date } = req.body;
    
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
            notes
        });

        await usage.save();

        product.availableQuantity -= convertedAmount;
        await product.save();

        res.status(201).json(usage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// obtener todos los registros de uso
router.get('/history', verifyToken, async (req, res) => {
    try {
        const usages = await Usage.find().populate('product');
        res.json(usages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// obtener un registro de uso especifico
router.get('/history/:id', verifyToken, async (req, res) => {
    try {
      const usage = await Usage.findById(req.params.id).populate('product');
      if (!usage) return res.status(404).json({ message: 'Registro de uso no encontrado' });
      res.json(usage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// eleiminar un registro especifico
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
      const deletedUsage = await Usage.findByIdAndDelete(req.params.id);
      if (!deletedUsage) return res.status(404).json({ message: 'Registro de uso no encontrado' });
      res.json({ message: 'Registro de uso eliminado', deletedUsage });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;