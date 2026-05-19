const express = require("express");

const router = express.Router();

const db = require("../db");


// =====================================
// OBTENER USUARIOS
// =====================================

router.get("/", (req, res) => {

  const sql = `
    SELECT
      id,
      nombre,
      correo,
      rol
    FROM usuarios
    ORDER BY nombre ASC
  `;

  db.query(sql, (err, results) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        mensaje:
          "Error al obtener usuarios",
      });
    }

    res.json(results);

  });

});

module.exports = router;