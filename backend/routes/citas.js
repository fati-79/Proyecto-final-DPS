const express = require("express");

const router = express.Router();

const db = require("../db");

// MIDDLEWARES
const verificarToken =
  require("../middleware/authMiddleware");

const verificarDoctorOAdmin =
  require("../middleware/doctorAdminMiddleware");

// =============================
// VALIDAR FECHA
// =============================
const validarFecha = (fecha) => {

  const fechaActual =
    new Date()
      .toISOString()
      .split("T")[0];

  return fecha >= fechaActual;
};

// =============================
// VALIDAR HORA
// =============================
const validarHora = (hora) => {

  const horaRegex =
    /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

  if (!horaRegex.test(hora)) {
    return false;
  }

  if (
    hora < "08:00:00" ||
    hora > "17:00:00"
  ) {
    return false;
  }

  return true;
};

// =============================
// CREAR CITA
// =============================
router.post(
  "/crear",
  verificarToken,
  (req, res) => {

    let {
      paciente_id,
      doctor_id,
      motivo_id,
      fecha,
      hora,
      observaciones,
    } = req.body;

    // SI ES PACIENTE
    if (req.usuario.rol === "paciente") {
      paciente_id = req.usuario.id;
    }

    // VALIDACIONES
    if (
      !doctor_id ||
      !motivo_id ||
      !fecha ||
      !hora
    ) {
      return res.status(400).json({
        mensaje:
          "Todos los campos obligatorios deben completarse",
      });
    }

    // VALIDAR FECHA
    if (!validarFecha(fecha)) {
      return res.status(400).json({
        mensaje:
          "No se pueden agendar citas en fechas pasadas",
      });
    }

    // VALIDAR HORA
    if (!validarHora(hora)) {
      return res.status(400).json({
        mensaje:
          "Horario disponible solo entre 08:00 AM y 05:00 PM",
      });
    }

    // VALIDAR DISPONIBILIDAD
    const verificarDisponibilidadSql = `
      SELECT *
      FROM citas
      WHERE doctor_id = ?
      AND fecha = ?
      AND hora = ?
      AND LOWER(estado) != 'cancelada'
    `;

    // INSERTAR CITA
    const insertarSql = `
      INSERT INTO citas
      (
        paciente_id,
        doctor_id,
        motivo_id,
        fecha,
        hora,
        observaciones,
        estado
      )
      VALUES
      (?, ?, ?, ?, ?, ?, 'activa')
    `;

    db.query(
      verificarDisponibilidadSql,
      [doctor_id, fecha, hora],
      (err, results) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            mensaje:
              "Error al verificar disponibilidad",
          });
        }

        // HORARIO OCUPADO
        if (results.length > 0) {

          return res.status(400).json({
            mensaje:
              "El doctor ya tiene una cita en ese horario",
          });
        }

        // CREAR CITA
        db.query(
          insertarSql,
          [
            paciente_id,
            doctor_id,
            motivo_id,
            fecha,
            hora,
            observaciones || "",
          ],
          (err) => {

            if (err) {

              console.log(err);

              return res.status(500).json({
                mensaje:
                  "Error al crear cita",
              });
            }

            res.status(201).json({
              mensaje:
                "Cita agendada correctamente",
            });
          }
        );
      }
    );
  }
);

// =============================
// VER TODAS LAS CITAS
// =============================
router.get(
  "/ver",
  verificarToken,
  verificarDoctorOAdmin,
  (req, res) => {

    let sql = `
      SELECT
        citas.id,

        p.nombre AS paciente,

        u.nombre AS doctor,

        especialidades.nombre
          AS especialidad,

        motivos_cita.nombre
          AS motivo,

        DATE_FORMAT(
          citas.fecha,
          '%Y-%m-%d'
        ) AS fecha,

        TIME_FORMAT(
          citas.hora,
          '%H:%i:%s'
        ) AS hora,

        citas.estado,

        citas.observaciones

      FROM citas

      INNER JOIN usuarios p
        ON citas.paciente_id = p.id

      INNER JOIN doctores d
        ON citas.doctor_id = d.id

      INNER JOIN usuarios u
        ON d.usuario_id = u.id

      INNER JOIN especialidades
        ON d.especialidad_id =
           especialidades.id

      INNER JOIN motivos_cita
        ON citas.motivo_id =
           motivos_cita.id
    `;

    const params = [];

    // SI ES DOCTOR
    if (req.usuario.rol === "doctor") {

      sql += `
        WHERE d.usuario_id = ?
      `;

      params.push(req.usuario.id);
    }

    sql += `
      ORDER BY
        citas.fecha DESC,
        citas.hora DESC
    `;

    db.query(
      sql,
      params,
      (err, results) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            mensaje:
              "Error al obtener citas",
          });
        }

        res.json(results);
      }
    );
  }
);

// =============================
// MIS CITAS
// =============================
router.get(
  "/mis-citas",
  verificarToken,
  (req, res) => {

    if (req.usuario.rol !== "paciente") {

      return res.status(403).json({
        mensaje:
          "Acceso solo para pacientes",
      });
    }

    const sql = `
      SELECT
        citas.id,

        u.nombre AS doctor,

        especialidades.nombre
          AS especialidad,

        motivos_cita.nombre
          AS motivo,

        DATE_FORMAT(
          citas.fecha,
          '%Y-%m-%d'
        ) AS fecha,

        TIME_FORMAT(
          citas.hora,
          '%H:%i:%s'
        ) AS hora,

        citas.estado,

        citas.observaciones

      FROM citas

      INNER JOIN doctores d
        ON citas.doctor_id = d.id

      INNER JOIN usuarios u
        ON d.usuario_id = u.id

      INNER JOIN especialidades
        ON d.especialidad_id =
           especialidades.id

      INNER JOIN motivos_cita
        ON citas.motivo_id =
           motivos_cita.id

      WHERE citas.paciente_id = ?

      ORDER BY
        citas.fecha DESC,
        citas.hora DESC
    `;

    db.query(
      sql,
      [req.usuario.id],
      (err, results) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            mensaje:
              "Error al obtener citas",
          });
        }

        res.json(results);
      }
    );
  }
);

// =============================
// REPROGRAMAR CITA
// =============================
router.put(
  "/reprogramar/:id",
  verificarToken,
  (req, res) => {

    const { id } = req.params;

    const { fecha, hora } = req.body;

    // VALIDACIONES
    if (!fecha || !hora) {

      return res.status(400).json({
        mensaje:
          "Fecha y hora son obligatorias",
      });
    }

    if (!validarFecha(fecha)) {

      return res.status(400).json({
        mensaje:
          "No se puede reprogramar a una fecha pasada",
      });
    }

    if (!validarHora(hora)) {

      return res.status(400).json({
        mensaje:
          "Horario inválido",
      });
    }

    const obtenerSql = `
      SELECT
        doctor_id,
        estado
      FROM citas
      WHERE id = ?
    `;

    db.query(
      obtenerSql,
      [id],
      (err, results) => {

        if (
          err ||
          results.length === 0
        ) {

          return res.status(404).json({
            mensaje:
              "Cita no encontrada",
          });
        }

        const cita = results[0];

        // NO REPROGRAMAR CANCELADAS
        if (
          String(cita.estado)
            .toLowerCase() ===
          "cancelada"
        ) {

          return res.status(400).json({
            mensaje:
              "No se puede reprogramar una cita cancelada",
          });
        }

        // VALIDAR CONFLICTO
        const verificarSql = `
          SELECT id
          FROM citas
          WHERE doctor_id = ?
          AND fecha = ?
          AND hora = ?
          AND id != ?
          AND LOWER(estado) != 'cancelada'
        `;

        db.query(
          verificarSql,
          [
            cita.doctor_id,
            fecha,
            hora,
            id,
          ],
          (err, conflicto) => {

            if (err) {

              return res.status(500).json({
                mensaje:
                  "Error al verificar disponibilidad",
              });
            }

            if (
              conflicto.length > 0
            ) {

              return res.status(400).json({
                mensaje:
                  "El doctor ya tiene una cita en ese horario",
              });
            }

            // ACTUALIZAR
            const actualizarSql = `
              UPDATE citas
              SET
                fecha = ?,
                hora = ?,
                estado = 'reprogramada'
              WHERE id = ?
            `;

            db.query(
              actualizarSql,
              [fecha, hora, id],
              (err) => {

                if (err) {

                  return res.status(500).json({
                    mensaje:
                      "Error al reprogramar cita",
                  });
                }

                res.json({
                  mensaje:
                    "Cita reprogramada correctamente",
                });
              }
            );
          }
        );
      }
    );
  }
);

// =============================
// CANCELAR CITA
// =============================
router.put(
  "/cancelar/:id",
  verificarToken,
  (req, res) => {

    const { id } = req.params;

    const sql = `
      UPDATE citas
      SET estado = 'cancelada'
      WHERE id = ?
    `;

    db.query(
      sql,
      [id],
      (err, result) => {

        if (err) {

          return res.status(500).json({
            mensaje:
              "Error al cancelar cita",
          });
        }

        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            mensaje:
              "Cita no encontrada",
          });
        }

        res.json({
          mensaje:
            "Cita cancelada correctamente",
        });
      }
    );
  }
);

// =============================
// COMPLETAR CITA
// =============================
router.put(
  "/completar/:id",
  verificarToken,
  (req, res) => {

    const citaId =
      req.params.id;

    const sql = `
      UPDATE citas
      SET estado = 'completada'
      WHERE id = ?
    `;

    db.query(
      sql,
      [citaId],
      (err, result) => {

        if (err) {

          return res.status(500).json({
            mensaje:
              "Error al completar cita",
          });
        }

        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            mensaje:
              "Cita no encontrada",
          });
        }

        res.json({
          mensaje:
            "Cita completada correctamente",
        });
      }
    );
  }
);

// =============================
// CITAS DEL DOCTOR
// =============================
router.get(
  "/doctor",
  verificarToken,
  (req, res) => {

    const usuario_id =
      req.usuario.id;

    const sql = `
      SELECT
        c.id,

        DATE_FORMAT(
          c.fecha,
          '%Y-%m-%d'
        ) AS fecha,

        TIME_FORMAT(
          c.hora,
          '%H:%i:%s'
        ) AS hora,

        c.estado,

        u.nombre
          AS paciente_nombre,

        m.nombre
          AS motivo_nombre

      FROM citas c

      INNER JOIN usuarios u
        ON c.paciente_id = u.id

      INNER JOIN motivos_cita m
        ON c.motivo_id = m.id

      INNER JOIN doctores d
        ON c.doctor_id = d.id

      WHERE d.usuario_id = ?

      AND LOWER(c.estado)
      IN ('activa', 'reprogramada')

      AND c.fecha >= CURDATE()

      ORDER BY
        c.fecha ASC,
        c.hora ASC
    `;

    db.query(
      sql,
      [usuario_id],
      (error, results) => {

        if (error) {

          console.log(error);

          return res.status(500).json({
            mensaje:
              "Error al obtener citas",
          });
        }

        res.json(results);
      }
    );
  }
);

// =============================
// HISTORIAL DEL DOCTOR
// =============================
router.get(
  "/historial-doctor",
  verificarToken,
  (req, res) => {

    const usuario_id =
      req.usuario.id;

    const sql = `
      SELECT
        c.id,

        DATE_FORMAT(
          c.fecha,
          '%Y-%m-%d'
        ) AS fecha,

        TIME_FORMAT(
          c.hora,
          '%H:%i:%s'
        ) AS hora,

        c.estado,

        u.nombre
          AS paciente_nombre,

        m.nombre
          AS motivo_nombre

      FROM citas c

      INNER JOIN usuarios u
        ON c.paciente_id = u.id

      INNER JOIN motivos_cita m
        ON c.motivo_id = m.id

      INNER JOIN doctores d
        ON c.doctor_id = d.id

      WHERE d.usuario_id = ?

      AND (
        LOWER(c.estado)
        IN ('cancelada', 'completada')

        OR c.fecha < CURDATE()
      )

      ORDER BY
        c.fecha DESC,
        c.hora DESC
    `;

    db.query(
      sql,
      [usuario_id],
      (error, results) => {

        if (error) {

          console.log(error);

          return res.status(500).json({
            mensaje:
              "Error al obtener historial",
          });
        }

        res.json(results);
      }
    );
  }
);

// =============================
// TODAS LAS CITAS
// =============================
router.get(
  "/todas",
  verificarToken,
  (req, res) => {

    const sql = `
      SELECT
        c.id,

        p.nombre AS paciente,

        u.nombre AS doctor,

        e.nombre AS especialidad,

        m.nombre AS motivo,

        DATE_FORMAT(
          c.fecha,
          '%Y-%m-%d'
        ) AS fecha,

        TIME_FORMAT(
          c.hora,
          '%H:%i:%s'
        ) AS hora,

        c.estado

      FROM citas c

      INNER JOIN usuarios p
        ON c.paciente_id = p.id

      INNER JOIN doctores d
        ON c.doctor_id = d.id

      INNER JOIN usuarios u
        ON d.usuario_id = u.id

      INNER JOIN especialidades e
        ON d.especialidad_id = e.id

      INNER JOIN motivos_cita m
        ON c.motivo_id = m.id

      ORDER BY
        c.fecha DESC,
        c.hora DESC
    `;

    db.query(
      sql,
      (error, results) => {

        if (error) {

          console.log(error);

          return res.status(500).json({
            mensaje:
              "Error al obtener citas",
          });
        }

        res.json(results);
      }
    );
  }
);

module.exports = router;