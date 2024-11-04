// middleware/verifyToken.js
// middleware para verificación del token con JWT
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    //obtenemos el token del header utilizando el authorization
    const token = req.headers['authorization']?.split(' ')[1]; 

    // control de obtención del token
    if (!token) {
        return res.status(403).send({ message: 'No se proporcionó un token.' });
    }

    // verificacion del token utilizando el secret y decodificando
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { 
        if (err) {
            return res.status(401).send({ message: 'Token inválido.' });
        }
        req.userId = decoded._id; 
        next();
    });
};

module.exports = verifyToken;

