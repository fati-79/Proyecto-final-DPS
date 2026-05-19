const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todas las especialidades
router.get("/", (req, res) => {
  const sql = "SELECT id, nombre FROM especialidades";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener especialidades:", err);
      return res.status(500).json({
        mensaje: "Error al obtener especialidades",
      });
    }

    res.json(results);
  });
});
// =====================================
// AGREGAR ESPECIALIDAD
// =====================================

router.post("/", (req, res) => {
  if (!nombre || nombre.trim() === "") {
  return res.status(400).json({
    mensaje:
      "La especialidad es obligatoria",
  });
}
  const { nombre } = req.body;

  const sql = `
    INSERT INTO especialidades (nombre)
    VALUES (?)
  `;

  db.query(sql, [nombre], (err, result) => {
    if (err) {
      console.error(
        "Error al agregar especialidad:",
        err
      );

      return res.status(500).json({
        mensaje:
          "Error al agregar especialidad",
      });
    }

    res.json({
      mensaje:
        "Especialidad agregada correctamente",
    });
  });
});


// =====================================
// ELIMINAR ESPECIALIDAD
// =====================================

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM especialidades
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(
        "Error al eliminar especialidad:",
        err
      );

      return res.status(500).json({
        mensaje:
          "Error al eliminar especialidad",
      });
    }

    res.json({
      mensaje:
        "Especialidad eliminada correctamente",
    });
  });
});
module.exports = router;