const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate de que la ruta sea correcta
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Ruta para obtener el nombre de usuario
router.get('/me', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.userId); // `req.userId` debe estar en el token
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  
      res.json({ name: user.name });
    } catch (error) {
      res.status(500).json({ message: 'Error del servidor' });
    }
});

// Registro de usuario
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Usuario ya existe' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear un nuevo usuario
    const user = new User({ name, email, password: hashedPassword });
    
    try {
        await user.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Email o contraseña incorrectos' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ message: 'Email o contraseña incorrectos' });
    }

    // Crear y asignar un token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.header('Authorization', token).json({ token });
});

module.exports = router;
