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

// Obtener todos los lotes
router.get('/all', verifyToken, async (req, res) => {
  try {
    const lots = await Lot.find();
    res.json(lots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
