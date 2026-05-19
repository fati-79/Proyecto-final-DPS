const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = "SELECT id, nombre FROM motivos_cita";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener motivos:", err);
      return res.status(500).json({
        mensaje: "Error al obtener motivos",
      });
    }

    res.json(results);
  });
});

module.exports = router;