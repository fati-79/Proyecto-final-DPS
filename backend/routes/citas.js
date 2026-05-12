const express = require('express');
const router = express.Router();
const db = require('../db');


// CREAR CITA
router.post('/crear', (req, res) => {
    const { paciente_id, doctor_id, motivo_id, fecha, hora, observaciones } = req.body;

    if (!paciente_id || !doctor_id || !motivo_id || !fecha || !hora) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben completarse'
        });
    }

    // Verificar disponibilidad del doctor
    const verificarSql = `
        SELECT * FROM citas
        WHERE doctor_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'
    `;

    db.query(verificarSql, [doctor_id, fecha, hora], (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al verificar disponibilidad'
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                mensaje: 'El doctor ya tiene una cita en ese horario'
            });
        }

        const sql = `
            INSERT INTO citas (paciente_id, doctor_id, motivo_id, fecha, hora, observaciones)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [paciente_id, doctor_id, motivo_id, fecha, hora, observaciones],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Error al crear cita',
                       error: err
                    });
                }

                res.status(201).json({
                    mensaje: 'Cita agendada correctamente'
                });
            }
        );
    });
});


// VER TODAS LAS CITAS
router.get('/ver', (req, res) => {
    const sql = `
        SELECT 
            citas.id,
            p.nombre AS paciente,
            u.nombre AS doctor,
            especialidades.nombre AS especialidad,
            motivos_cita.nombre AS motivo,
            DATE_FORMAT(citas.fecha, '%Y-%m-%d') AS fecha,
TIME_FORMAT(citas.hora, '%H:%i:%s') AS hora,
            citas.estado,
            citas.observaciones
        FROM citas
        INNER JOIN usuarios p ON citas.paciente_id = p.id
        INNER JOIN doctores d ON citas.doctor_id = d.id
        INNER JOIN usuarios u ON d.usuario_id = u.id
        INNER JOIN especialidades ON d.especialidad_id = especialidades.id
        INNER JOIN motivos_cita ON citas.motivo_id = motivos_cita.id
        ORDER BY citas.fecha ASC, citas.hora ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al obtener citas'
            });
        }

        res.json(results);
    });
});

module.exports = router;