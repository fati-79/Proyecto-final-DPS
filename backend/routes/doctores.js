const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener doctores con especialidad
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.telefono,
      d.especialidad_id,
      u.nombre,
      u.correo,
      e.nombre AS especialidad
    FROM doctores d
    INNER JOIN usuarios u ON d.usuario_id = u.id
    LEFT JOIN especialidades e
ON d.especialidad_id = e.id
    ORDER BY u.nombre ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener doctores:", err);
      return res.status(500).json({
        mensaje: "Error al obtener doctores",
      });
    }

    res.json(results);
  });
});
// =====================================
// ELIMINAR DOCTOR
// =====================================

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM doctores
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar doctor:", err);

      return res.status(500).json({
        mensaje: "Error al eliminar doctor",
      });
    }

    res.json({
      mensaje: "Doctor eliminado correctamente",
    });
  });
});
// =====================================
// AGREGAR DOCTOR
// =====================================

router.post("/", (req, res) => {
  // VALIDACIONES

if (!nombre || nombre.trim() === "") {
  return res.status(400).json({
    mensaje: "Nombre obligatorio",
  });
}

if (!correo || correo.trim() === "") {
  return res.status(400).json({
    mensaje: "Correo obligatorio",
  });
}

if (!telefono || telefono.trim() === "") {
  return res.status(400).json({
    mensaje: "Teléfono obligatorio",
  });
}

if (!especialidad_id) {
  return res.status(400).json({
    mensaje:
      "Especialidad obligatoria",
  });
}
  const {
    nombre,
    correo,
    telefono,
    especialidad_id,
  } = req.body;

  // contraseña por defecto
  const { password } = req.body;
  

  // 1. crear usuario
  const sqlUsuario = `
    INSERT INTO usuarios
    (nombre, correo, password, rol)
    VALUES (?, ?, ?, 'doctor')
  `;
const verificarCorreo = `
  SELECT id
  FROM usuarios
  WHERE correo = ?
`;
  db.query(
    sqlUsuario,
    [nombre, correo, password],
    (err, resultUsuario) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          mensaje:
            "Error al crear usuario doctor",
        });
      }

      const usuario_id = resultUsuario.insertId;

      // 2. crear doctor
      const sqlDoctor = `
        INSERT INTO doctores
        (
          usuario_id,
          especialidad_id,
          telefono
        )
        VALUES (?, ?, ?)
      `;

      db.query(
        sqlDoctor,
        [
          usuario_id,
          especialidad_id,
          telefono,
        ],
        (err, resultDoctor) => {
          if (err) {
           console.log(err);

            return res.status(500).json({
              mensaje:
                "Error al guardar doctor",
            });
          }

          res.json({
            mensaje:
              "Doctor agregado correctamente",
          });
        }
      );
    }
  );
});
// =====================================
// EDITAR DOCTOR
// =====================================

router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    nombre,
    correo,
    telefono,
  } = req.body;

  const sqlDoctor = `
    UPDATE doctores
    SET telefono = ?
    WHERE id = ?
  `;

  db.query(
    sqlDoctor,
    [telefono, id],
    (err, result) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          mensaje:
            "Error al actualizar doctor",
        });
      }

      const sqlUsuario = `
        UPDATE usuarios
        SET nombre = ?, correo = ?
        WHERE id = (
          SELECT usuario_id
          FROM doctores
          WHERE id = ?
        )
      `;

      db.query(
        sqlUsuario,
        [nombre, correo, id],
        (err2, result2) => {
          if (err2) {
            console.log(err2);

            return res.status(500).json({
              mensaje:
                "Error al actualizar usuario",
            });
          }

          res.json({
            mensaje:
              "Doctor actualizado correctamente",
          });
        }
      );
    }
  );
});
module.exports = router;