const express = require("express");
const cors = require("cors");

// Conexión DB
const db = require("./db");

// Rutas
const authRoutes = require("./routes/auth");
const citasRoutes = require("./routes/citas");
const especialidadesRoutes = require("./routes/especialidades");
const motivosRoutes = require("./routes/motivos");
const doctoresRoutes = require("./routes/doctores");
const doctorRoutes = require("./routes/doctor");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());


// Verificar conexión a BD al iniciar
db.connect((err) => {
  if (err) {
    console.error("Error de conexión a MySQL:", err);
  } else {
    console.log("Conectado a MySQL correctamente");
  }
});

// Ruta principal
app.get("/", (req, res) => {
  res.send("API de Gestión de Citas funcionando correctamente");
});

// Rutas API
app.use("/auth", authRoutes);
app.use("/citas", citasRoutes);
app.use("/especialidades", especialidadesRoutes);
app.use("/motivos", motivosRoutes);
app.use("/doctores", doctoresRoutes);
app.use("/doctor", doctorRoutes);

// Manejo básico de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada",
  });
});

// Manejo general de errores
app.use((err, req, res, next) => {
  console.error("Error del servidor:", err);
  res.status(500).json({
    mensaje: "Error interno del servidor",
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});