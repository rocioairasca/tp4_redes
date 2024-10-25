// middleware/verifyToken.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token de los headers

    if (!token) {
        return res.status(403).send({ message: 'No se proporcionó un token.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { // Asegúrate de que 'process.env.JWT_SECRET' está definido
        if (err) {
            return res.status(401).send({ message: 'Token inválido.' });
        }
        req.userId = decoded._id; // Almacenar el id del usuario en la solicitud
        next(); // Llamar al siguiente middleware o ruta
    });
};

module.exports = verifyToken;

