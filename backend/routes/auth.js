const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'gestioncitas_secret';

router.post('/registro', async (req, res) => {
    const { nombre, correo, password, rol, telefono } = req.body;

    // VALIDAR CAMPOS VACÍOS
    if (!nombre || !correo || !password || !rol || !telefono) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    // VALIDAR NOMBRE (solo letras y espacios)
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    if (!nombreRegex.test(nombre)) {
        return res.status(400).json({
            mensaje: 'El nombre solo debe contener letras'
        });
    }

    // VALIDAR CORREO
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
        return res.status(400).json({
            mensaje: 'Formato de correo inválido'
        });
    }

    // VALIDAR CONTRASEÑA
    if (password.length < 6) {
        return res.status(400).json({
            mensaje: 'La contraseña debe tener al menos 6 caracteres'
        });
    }

    // VALIDAR ROL
    const rolesPermitidos = ['paciente', 'doctor', 'admin'];
    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({
            mensaje: 'Rol no válido'
        });
    }

    // VALIDAR TELÉFONO (solo números, 8 dígitos)
    const telefonoRegex = /^[0-9]{8}$/;
    if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({
            mensaje: 'El teléfono debe contener exactamente 8 números'
        });
    }

    try {
        // VERIFICAR SI CORREO YA EXISTE
        db.query(
            'SELECT * FROM usuarios WHERE correo = ?',
            [correo],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Error del servidor'
                    });
                }

                if (results.length > 0) {
                    return res.status(400).json({
                        mensaje: 'El correo ya está registrado'
                    });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO usuarios (nombre, correo, password, rol, telefono)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [nombre, correo, hashedPassword, rol, telefono],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({
                                mensaje: 'Error al registrar usuario',
                                error: err
                            });
                        }

                        res.status(201).json({
                            mensaje: 'Usuario registrado correctamente'
                        });
                    }
                );
            }
        );

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            error
        });
    }
});

router.post('/login', (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const sql = 'SELECT * FROM usuarios WHERE correo = ?';

    db.query(sql, [correo], async (err, results) => {
        if (err) {
            return res.status(500).json({ mensaje: 'Error del servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = results[0];

        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            SECRET_KEY,
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    });
});
router.get('/usuarios', (req, res) => {
    const sql = 'SELECT id, nombre, correo, rol, telefono, fecha_registro FROM usuarios';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al obtener usuarios'
            });
        }

        res.json(results);
    });
});

module.exports = router;