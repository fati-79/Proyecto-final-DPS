const jwt = require('jsonwebtoken');

const SECRET_KEY = 'gestioncitas_secret';

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Verificar si existe token
    if (!authHeader) {
        return res.status(403).json({
            mensaje: 'Token requerido'
        });
    }

    // Validar formato Bearer
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            mensaje: 'Formato de token inválido'
        });
    }

    // Obtener token limpio
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
        return res.status(403).json({
            mensaje: 'Formato de token inválido'
        });
    }

    // Verificar token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                mensaje: 'Token inválido o expirado'
            });
        }

        req.usuario = decoded;

        next();
    });
};

module.exports = verificarToken;