const express = require('express');
const router = express.Router();
const db = require('../db');

const verificarToken = require('../middleware/authMiddleware');
const verificarDoctorOAdmin = require('../middleware/doctorAdminMiddleware');

// Validar que la fecha no sea pasada
const validarFecha = (fecha) => {
    const fechaActual = new Date().toISOString().split('T')[0];
    return fecha >= fechaActual;
};

// Validar formato y horario permitido
const validarHora = (hora) => {
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

    if (!horaRegex.test(hora)) return false;
    if (hora < '08:00:00' || hora > '17:00:00') return false;

    return true;
};

// Crear cita
router.post('/crear', verificarToken, (req, res) => {
    let { paciente_id, doctor_id, motivo_id, fecha, hora, observaciones } = req.body;

    // Si es paciente, usa su propio ID
    if (req.usuario.rol === 'paciente') {
        paciente_id = req.usuario.id;
    }

    // Validar campos obligatorios
    if (!paciente_id || !doctor_id || !motivo_id || !fecha || !hora) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben completarse'
        });
    }

    // Validar fecha
    if (!validarFecha(fecha)) {
        return res.status(400).json({
            mensaje: 'No se pueden agendar citas en fechas pasadas'
        });
    }

    // Validar hora
    if (!validarHora(hora)) {
        return res.status(400).json({
            mensaje: 'Horario disponible solo entre 08:00 AM y 05:00 PM con formato válido'
        });
    }

    const verificarDoctorSql = 'SELECT * FROM doctores WHERE id = ?';
    const verificarMotivoSql = 'SELECT * FROM motivos_cita WHERE id = ?';

    // Verificar si ya existe una cita en ese horario
    const verificarDisponibilidadSql = `
        SELECT * FROM citas
        WHERE doctor_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'
    `;

    // Insertar cita
    const insertarSql = `
        INSERT INTO citas (paciente_id, doctor_id, motivo_id, fecha, hora, observaciones)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Verificar doctor
    db.query(verificarDoctorSql, [doctor_id], (err, doctorResults) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al verificar doctor',
                error: err
            });
        }

        if (doctorResults.length === 0) {
            return res.status(404).json({
                mensaje: 'Doctor no encontrado'
            });
        }

        // Verificar motivo
        db.query(verificarMotivoSql, [motivo_id], (err, motivoResults) => {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al verificar motivo',
                    error: err
                });
            }

            if (motivoResults.length === 0) {
                return res.status(404).json({
                    mensaje: 'Motivo no encontrado'
                });
            }

            // Verificar disponibilidad
            db.query(verificarDisponibilidadSql, [doctor_id, fecha, hora], (err, results) => {
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

                // Guardar cita
                db.query(
                    insertarSql,
                    [paciente_id, doctor_id, motivo_id, fecha, hora, observaciones],
                    (err) => {
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
    });
});

// Ver citas (admin ve todas, doctor solo las suyas)
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

    const params = [];

    // Si es doctor, filtrar solo sus citas
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

// Reprogramar cita
router.put('/reprogramar/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { fecha, hora } = req.body;

    // Validar datos
    if (!fecha || !hora) {
        return res.status(400).json({
            mensaje: 'Fecha y hora son obligatorias'
        });
    }

    if (!validarFecha(fecha)) {
        return res.status(400).json({
            mensaje: 'No se puede reprogramar a una fecha pasada'
        });
    }

    if (!validarHora(hora)) {
        return res.status(400).json({
            mensaje: 'Horario disponible solo entre 08:00 AM y 05:00 PM con formato válido'
        });
    }

    // Obtener datos de la cita
    const obtenerDoctorSql = `
        SELECT citas.doctor_id, citas.estado, citas.paciente_id, d.usuario_id AS doctor_usuario_id
        FROM citas
        INNER JOIN doctores d ON citas.doctor_id = d.id
        WHERE citas.id = ?
    `;

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

        // Validar permisos
        if (
            req.usuario.rol !== 'admin' &&
            !(
                (req.usuario.rol === 'paciente' && results[0].paciente_id == req.usuario.id) ||
                (req.usuario.rol === 'doctor' && results[0].doctor_usuario_id == req.usuario.id)
            )
        ) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para reprogramar esta cita'
            });
        }

        // No permitir reprogramar canceladas
        if (results[0].estado === 'cancelada') {
            return res.status(400).json({
                mensaje: 'No se puede reprogramar una cita cancelada'
            });
        }

        const doctor_id = results[0].doctor_id;

        // Verificar conflicto de horario
        const verificarDisponibilidadSql = `
            SELECT * FROM citas
            WHERE doctor_id = ?
            AND fecha = ?
            AND hora = ?
            AND id != ?
            AND estado != 'cancelada'
        `;

        db.query(verificarDisponibilidadSql, [doctor_id, fecha, hora, id], (err, conflicto) => {
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

            // Actualizar cita
            const actualizarSql = `
                UPDATE citas
                SET fecha = ?, hora = ?, estado = 'reprogramada'
                WHERE id = ?
            `;

            db.query(actualizarSql, [fecha, hora, id], (err) => {
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

// Cancelar cita
router.put('/cancelar/:id', verificarToken, (req, res) => {
    const { id } = req.params;

    // Buscar cita
    const verificarSql = `
        SELECT citas.estado, citas.paciente_id, d.usuario_id AS doctor_usuario_id
        FROM citas
        INNER JOIN doctores d ON citas.doctor_id = d.id
        WHERE citas.id = ?
    `;

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

        // Validar permisos
        if (
            req.usuario.rol !== 'admin' &&
            !(
                (req.usuario.rol === 'paciente' && results[0].paciente_id == req.usuario.id) ||
                (req.usuario.rol === 'doctor' && results[0].doctor_usuario_id == req.usuario.id)
            )
        ) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para cancelar esta cita'
            });
        }

        // Evitar cancelar dos veces
        if (results[0].estado === 'cancelada') {
            return res.status(400).json({
                mensaje: 'La cita ya está cancelada'
            });
        }

        // Cancelar
        const cancelarSql = `
            UPDATE citas
            SET estado = 'cancelada'
            WHERE id = ?
        `;

        db.query(cancelarSql, [id], (err) => {
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

// Ver citas del paciente autenticado
router.get('/mis-citas', verificarToken, (req, res) => {
    // Solo pacientes
    if (req.usuario.rol !== 'paciente') {
        return res.status(403).json({
            mensaje: 'Acceso solo para pacientes'
        });
    }

    const sql = `
        SELECT 
            citas.id,
            u.nombre AS doctor,
            especialidades.nombre AS especialidad,
            motivos_cita.nombre AS motivo,
            DATE_FORMAT(citas.fecha, '%Y-%m-%d') AS fecha,
            TIME_FORMAT(citas.hora, '%H:%i:%s') AS hora,
            citas.estado,
            citas.observaciones
        FROM citas
        INNER JOIN doctores d ON citas.doctor_id = d.id
        INNER JOIN usuarios u ON d.usuario_id = u.id
        INNER JOIN especialidades ON d.especialidad_id = especialidades.id
        INNER JOIN motivos_cita ON citas.motivo_id = motivos_cita.id
        WHERE citas.paciente_id = ?
        ORDER BY citas.fecha ASC, citas.hora ASC
    `;

    db.query(sql, [req.usuario.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al obtener citas del paciente',
                error: err
            });
        }

        res.json(results);
    });
});

module.exports = router;