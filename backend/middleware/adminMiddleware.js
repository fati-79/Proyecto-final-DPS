const verificarAdmin = (req, res, next) => {
    console.log('ROL DETECTADO:', req.usuario.rol);

    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso solo para administradores'
        });
    }

    next();
};

module.exports = verificarAdmin;