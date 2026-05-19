import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function SeleccionarDoctorScreen() {
  const params = useLocalSearchParams();
  const especialidad = String(params.especialidad || "");

  const doctoresPorEspecialidad: Record<
    string,
    { id: number; nombre: string }[]
  > = {
    "Medicina General": [
      { id: 1, nombre: "Dr. Juan Pérez" },
      { id: 2, nombre: "Dra. Ana López" },
    ],
    "Pediatría": [{ id: 3, nombre: "Dr. Carlos Martínez" }],
    "Ginecología": [{ id: 4, nombre: "Dra. Sofía Ramírez" }],
    "Cardiología": [{ id: 5, nombre: "Dr. Roberto Gómez" }],
  };

  const doctores = doctoresPorEspecialidad[especialidad] || [];

  const seleccionarDoctor = (doctor: { id: number; nombre: string }) => {
    const ruta = `/agendar-cita?doctor_id=${doctor.id}&especialidad=${encodeURIComponent(
      especialidad
    )}&doctor_nombre=${encodeURIComponent(doctor.nombre)}`;

    router.push(ruta as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doctores de {especialidad}</Text>

      {doctores.length > 0 ? (
        doctores.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={styles.button}
            onPress={() => seleccionarDoctor(doctor)}
          >
            <Text style={styles.buttonText}>{doctor.nombre}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noData}>
          No hay doctores disponibles para esta especialidad
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#F06292",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
    marginTop: 20,
  },
});