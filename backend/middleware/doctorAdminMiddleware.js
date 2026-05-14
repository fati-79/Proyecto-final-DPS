const verificarDoctorOAdmin = (req, res, next) => {
    console.log('ROL DETECTADO:', req.usuario.rol);

    if (req.usuario.rol !== 'doctor' && req.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso solo para doctores o administradores'
        });
    }

    next();
};

module.exports = verificarDoctorOAdmin;