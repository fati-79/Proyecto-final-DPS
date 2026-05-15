const verificarAdmin = (req, res, next) => {
    // Validar rol de administrador
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso solo para administradores'
        });
    }

    next();
};

module.exports = verificarAdmin;