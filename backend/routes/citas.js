const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/authMiddleware');
const verificarDoctorOAdmin = require('../middleware/doctorAdminMiddleware');


// CREAR CITA
router.post('/crear', (req, res) => {
    const { paciente_id, doctor_id, motivo_id, fecha, hora, observaciones } = req.body;

    if (!paciente_id || !doctor_id || !motivo_id || !fecha || !hora) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben completarse'
        });
    }

    // VALIDAR FECHA (no permitir fechas pasadas)
const fechaActual = new Date().toISOString().split('T')[0];

if (fecha < fechaActual) {
    return res.status(400).json({
        mensaje: 'No se pueden agendar citas en fechas pasadas'
    });
}

// VALIDAR FORMATO DE HORA Y HORARIO LABORAL (8 AM - 5 PM)
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

if (!horaRegex.test(hora)) {
    return res.status(400).json({
        mensaje: 'Formato de hora inválido'
    });
}

if (hora < '08:00:00' || hora > '17:00:00') {
    return res.status(400).json({
        mensaje: 'Horario disponible solo entre 08:00 AM y 05:00 PM'
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
router.get('/ver', verificarToken, verificarDoctorOAdmin, (req, res) => {

    let sql = `
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
    `;

    let params = [];

    // SI ES DOCTOR, SOLO VE SUS CITAS
    if (req.usuario.rol === 'doctor') {
        sql += ` WHERE d.usuario_id = ? `;
        params.push(req.usuario.id);
    }

    sql += ` ORDER BY citas.fecha ASC, citas.hora ASC`;

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al obtener citas',
                error: err
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
    // VALIDAR FECHA (no permitir fechas pasadas)
const fechaActual = new Date().toISOString().split('T')[0];

if (fecha < fechaActual) {
    return res.status(400).json({
        mensaje: 'No se puede reprogramar a una fecha pasada'
    });
}

// VALIDAR FORMATO DE HORA
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

if (!horaRegex.test(hora)) {
    return res.status(400).json({
        mensaje: 'Formato de hora inválido'
    });
}

// VALIDAR HORARIO MÉDICO
if (hora < '08:00:00' || hora > '17:00:00') {
    return res.status(400).json({
        mensaje: 'Horario disponible solo entre 08:00 AM y 05:00 PM'
    });
}

    // Obtener doctor de la cita
   const obtenerDoctorSql = `SELECT doctor_id, estado FROM citas WHERE id = ?`;

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

        if (results[0].estado === 'cancelada') {
            return res.status(400).json({
            mensaje: 'No se puede reprogramar una cita cancelada'
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

    // VERIFICAR SI EXISTE
    const verificarSql = 'SELECT estado FROM citas WHERE id = ?';

    db.query(verificarSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al verificar cita',
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensaje: 'Cita no encontrada'
            });
        }

        if (results[0].estado === 'cancelada') {
            return res.status(400).json({
                mensaje: 'La cita ya está cancelada'
            });
        }

        // CANCELAR
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

            res.json({
                mensaje: 'Cita cancelada correctamente'
            });
        });
    });
});

module.exports = router;