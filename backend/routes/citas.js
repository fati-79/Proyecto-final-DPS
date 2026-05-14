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

// REPROGRAMAR CITA
router.put('/reprogramar/:id', (req, res) => {
    const { id } = req.params;
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
        return res.status(400).json({
            mensaje: 'Fecha y hora son obligatorias'
        });
    }

    // Obtener doctor de la cita
    const obtenerDoctorSql = `SELECT doctor_id FROM citas WHERE id = ?`;

    db.query(obtenerDoctorSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al buscar cita',
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensaje: 'Cita no encontrada'
            });
        }

        const doctor_id = results[0].doctor_id;

        // Verificar conflicto horario
        const verificarSql = `
            SELECT * FROM citas
            WHERE doctor_id = ? 
            AND fecha = ? 
            AND hora = ?
            AND id != ?
            AND estado != 'cancelada'
        `;

        db.query(verificarSql, [doctor_id, fecha, hora, id], (err, conflicto) => {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al verificar disponibilidad',
                    error: err
                });
            }

            if (conflicto.length > 0) {
                return res.status(400).json({
                    mensaje: 'El doctor ya tiene una cita en ese horario'
                });
            }

            const actualizarSql = `
                UPDATE citas
                SET fecha = ?, hora = ?, estado = 'reprogramada'
                WHERE id = ?
            `;

            db.query(actualizarSql, [fecha, hora, id], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Error al reprogramar cita',
                        error: err
                    });
                }

                res.json({
                    mensaje: 'Cita reprogramada correctamente'
                });
            });
        });
    });
});

// CANCELAR CITA
router.put('/cancelar/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE citas
        SET estado = 'cancelada'
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al cancelar cita',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Cita no encontrada'
            });
        }

        res.json({
            mensaje: 'Cita cancelada correctamente'
        });
    });
});
module.exports = router;