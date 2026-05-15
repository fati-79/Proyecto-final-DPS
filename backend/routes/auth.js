const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const verificarToken = require('../middleware/authMiddleware');
const verificarAdmin = require('../middleware/adminMiddleware');

const SECRET_KEY = 'gestioncitas_secret';

// Registro de usuarios
router.post('/registro', (req, res) => {
    const { nombre, correo, password, rol, telefono } = req.body;

    // Validar campos vacíos
    if (!nombre || !correo || !password || !rol || !telefono) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    // Validar nombre
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nombreRegex.test(nombre)) {
        return res.status(400).json({
            mensaje: 'El nombre solo debe contener letras'
        });
    }

    // Validar correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
        return res.status(400).json({
            mensaje: 'Correo electrónico no válido'
        });
    }

    // Validar contraseña
    if (password.length < 6) {
        return res.status(400).json({
            mensaje: 'La contraseña debe tener al menos 6 caracteres'
        });
    }

    // Validar teléfono
    const telefonoRegex = /^[0-9]{8}$/;
    if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({
            mensaje: 'El teléfono debe tener exactamente 8 números'
        });
    }

    // Verificar correo existente
    const verificarCorreoSql = 'SELECT * FROM usuarios WHERE correo = ?';

    db.query(verificarCorreoSql, [correo], (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al verificar correo',
                error: err
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        // Encriptar contraseña
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al encriptar contraseña',
                    error: err
                });
            }

            // Insertar usuario
            const sql = `
                INSERT INTO usuarios (nombre, correo, password, rol, telefono)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(sql, [nombre, correo, hashedPassword, rol, telefono], (err) => {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Error al registrar usuario',
                        error: err
                    });
                }

                res.status(201).json({
                    mensaje: 'Usuario registrado correctamente'
                });
            });
        });
    });
});

// Login
router.post('/login', (req, res) => {
    const { correo, password } = req.body;

    // Validar campos
    if (!correo || !password) {
        return res.status(400).json({
            mensaje: 'Correo y contraseña son obligatorios'
        });
    }

    const sql = 'SELECT * FROM usuarios WHERE correo = ?';

    db.query(sql, [correo], async (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error del servidor'
            });
        }

        // Verificar usuario
        if (results.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        const usuario = results[0];

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({
                mensaje: 'Contraseña incorrecta'
            });
        }

        // Generar token
        const token = jwt.sign(
            {
                id: usuario.id,
                rol: usuario.rol
            },
            SECRET_KEY,
            {
                expiresIn: '8h'
            }
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

// Ver usuarios (solo admin)
router.get('/usuarios', verificarToken, verificarAdmin, (req, res) => {
    const sql = `
        SELECT id, nombre, correo, rol, telefono, fecha_registro
        FROM usuarios
    `;

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