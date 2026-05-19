import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function AdminScreen() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setMensaje("Bienvenido Administrador");

    const timer = setTimeout(() => {
      setMensaje("");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");

    router.replace("/");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {mensaje ? (
        <View style={styles.bienvenidaBox}>
          <Text style={styles.bienvenidaText}>
            {mensaje}
          </Text>
        </View>
      ) : null}

      <Text style={styles.title}>
        Administrador
      </Text>

      <TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push("/gestionar-usuarios")
  }
>
  <Text style={styles.buttonText}>
    Gestionar Doctores
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push("/gestionar-especialidades")
  }
>
  <Text style={styles.buttonText}>
    Gestionar Especialidades
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push("/seleccionar-especialidad")
  }
>
  <Text style={styles.buttonText}>
    Agendar Cita
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push("/todas-citas")
  }
>
  <Text style={styles.buttonText}>
    Reprogramar Cita
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push("/todas-citas")
  }
>
  <Text style={styles.buttonText}>
    Cancelar Cita
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push("/ver-usuarios")
  }
>
  <Text style={styles.buttonText}>
    Ver personas registradas
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push("/todas-citas")
  }
>
  <Text style={styles.buttonText}>
    Ver Citas
  </Text>
</TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={cerrarSesion}
      >
        <Text style={styles.buttonText}>
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    borderRadius: 12,
    marginBottom: 18,
    alignItems: "center",
  },

  logoutButton: {
    backgroundColor: "#C2185B",
    padding: 18,
    borderRadius: 12,
    marginTop: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  bienvenidaBox: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "#F8BBD0",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 15,
    zIndex: 10,
  },

  bienvenidaText: {
    color: "#880E4F",
    fontSize: 20,
    fontWeight: "bold",
  },
});