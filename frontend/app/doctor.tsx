import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorScreen() {
  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");

    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Doctor</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/citas-hoy")}
      >
        <Text style={styles.buttonText}>Mi Agenda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/historial-doctor")}
      >
        <Text style={styles.buttonText}>Historial</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={cerrarSesion}
      >
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
});