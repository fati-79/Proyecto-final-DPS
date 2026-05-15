const verificarDoctorOAdmin = (req, res, next) => {
    if (
        !req.usuario ||
        (req.usuario.rol !== 'doctor' && req.usuario.rol !== 'admin')
    ) {
        return res.status(403).json({
            mensaje: 'Acceso solo para doctores o administradores'
        });
    }

    next();
};

module.exports = verificarDoctorOAdmin;