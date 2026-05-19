import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function SeleccionarRolScreen() {
  const verificarRol = async (rolSeleccionado: string) => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        Alert.alert("Error", "No se encontró sesión activa");
        router.push("/");
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);

      if (usuario.rol !== rolSeleccionado) {
        Alert.alert(
          "Acceso denegado",
          `Tu cuenta no pertenece al rol de ${rolSeleccionado}`
        );
        return;
      }

      if (rolSeleccionado === "admin") {
        router.push("/admin");
      } else if (rolSeleccionado === "doctor") {
        router.push("/doctor");
      } else {
        router.push("/paciente");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo verificar el rol");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu Rol</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => verificarRol("paciente")}
      >
        <Text style={styles.buttonText}>Paciente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => verificarRol("doctor")}
      >
        <Text style={styles.buttonText}>Doctor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => verificarRol("admin")}
      >
        <Text style={styles.buttonText}>Administrador</Text>
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#F06292",
    padding: 18,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});