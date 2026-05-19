import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PacienteScreen() {
  const [mensaje, setMensaje] = useState("");

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");

    router.replace("/");
  };

  useEffect(() => {
    setMensaje("Bienvenido/a");

    const timer = setTimeout(() => {
      setMensaje("");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {mensaje ? (
        <View style={styles.bienvenidoBox}>
          <Text style={styles.bienvenidoText}>{mensaje}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>Panel del Paciente</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/seleccionar-especialidad")}
      >
        <Text style={styles.buttonText}>Agendar Cita</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/mis-citas")}
      >
        <Text style={styles.buttonText}>Mis Citas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
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
    fontSize: 28,
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
  logoutButton: {
    backgroundColor: "#e12d75",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  bienvenidoBox: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "#F8BBD0",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 15,
    zIndex: 10,
  },
  bienvenidoText: {
    color: "#880E4F",
    fontSize: 20,
    fontWeight: "bold",
  },
});