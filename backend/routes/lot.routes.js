// manejo de ruteo de lotes sin controlador

// requerimientos para el ruteo de los lotes
const express = require('express');
const Lot = require('../models/Lot');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Crear un nuevo lote
router.post('/create', verifyToken, async (req, res) => {
  try {
    const lot = new Lot(req.body);
    await lot.save();
    res.status(201).json(lot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener todos los lotes habilitados (con paginado)
router.get('/all', verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const totalLots = await Lot.countDocuments({ isDisabled: false });
    const lots = await Lot.find({ isDisabled: false }).skip(skip).limit(limit);
    res.json({
      totalLots,
      lots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un lote
router.put('/update/:id', verifyToken, async (req, res) => {
  try {
    const lot = await Lot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lot) {
      return res.status(404).json({ message: 'Lote no encontrado' });
    }
    res.json(lot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deshabilitar un lote
router.patch('/disable/:id', verifyToken, async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);
    if (!lot) {
      return res.status(404).json({ message: 'Lote no encontrado' });
    }

    lot.isDisabled = true; // Deshabilitar el lote
    await lot.save();
    res.json(lot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener lotes deshabilitados con paginado
router.get('/disabled', verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const totalLots = await Lot.countDocuments({ isDisabled: true });
    const lots = await Lot.find({ isDisabled: true }).skip(skip).limit(limit);
    res.json({
      totalLots,
      lots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Habilitar un lote
router.patch('/enable/:id', verifyToken, async (req, res) => {
  try {
    const lot = await Lot.findByIdAndUpdate(req.params.id, { isDisabled: false }, { new: true });
    if (!lot) {
      return res.status(404).json({ message: 'Lote no encontrado' });
    }
    res.json(lot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



module.exports = router;

