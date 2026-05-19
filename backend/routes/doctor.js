const express = require("express");
const router = express.Router();
const db = require("../db");

// Middleware correcto
const verificarToken = require("../middleware/authMiddleware");

// =============================
// AGENDA DEL DOCTOR
// =============================
router.get("/agenda", verificarToken, (req, res) => {
  try {
    // Compatibilidad con distintos middlewares
    const usuarioId = req.user?.id || req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    }

    const sql = `
      SELECT 
        c.id,
        u.nombre AS paciente,
        m.nombre AS motivo,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
        TIME_FORMAT(c.hora, '%H:%i:%s') AS hora,
        c.estado,
        c.observaciones
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN motivos_cita m ON c.motivo_id = m.id
      INNER JOIN doctores d ON c.doctor_id = d.id
      WHERE d.usuario_id = ?
      AND LOWER(c.estado) IN ('pendiente', 'reprogramada')
      ORDER BY c.fecha ASC, c.hora ASC
    `;

    db.query(sql, [usuarioId], (err, results) => {
      if (err) {
        console.error("Error agenda doctor:", err);
        return res.status(500).json({
          mensaje: "Error al obtener agenda",
          error: err,
        });
      }

      res.json(results || []);
    });
  } catch (error) {
    console.error("Error general agenda:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

// =============================
// HISTORIAL DEL DOCTOR
// =============================
router.get("/historial", verificarToken, (req, res) => {
  try {
    const usuarioId = req.user?.id || req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    }

    const sql = `
      SELECT 
        c.id,
        u.nombre AS paciente,
        m.nombre AS motivo,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
        TIME_FORMAT(c.hora, '%H:%i:%s') AS hora,
        c.estado,
        c.observaciones
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN motivos_cita m ON c.motivo_id = m.id
      INNER JOIN doctores d ON c.doctor_id = d.id
      WHERE d.usuario_id = ?
      AND LOWER(c.estado) = 'completada'
      ORDER BY c.fecha DESC, c.hora DESC
    `;

    db.query(sql, [usuarioId], (err, results) => {
      if (err) {
        console.error("Error historial doctor:", err);
        return res.status(500).json({
          mensaje: "Error al obtener historial",
          error: err,
        });
      }

      res.json(results || []);
    });
  } catch (error) {
    console.error("Error general historial:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

module.exports = router;