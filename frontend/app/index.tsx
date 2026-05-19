import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import api from "../services/api";

export default function LoginScreen() {

  const [correo, setCorreo] = useState("");

  const [password, setPassword] =
    useState("");

  const iniciarSesion = async () => {

    // VALIDAR CAMPOS VACÍOS
    if (!correo.trim() || !password.trim()) {

      Alert.alert(
        "Validación",
        "Completa todos los campos"
      );

      return;
    }

    // VALIDAR CORREO
    const regexCorreo =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexCorreo.test(correo)) {

      Alert.alert(
        "Validación",
        "Correo inválido"
      );

      return;
    }

    try {

      console.log("Enviando:", {
        correo,
        password,
      });

      const response = await api.post(
        "/auth/login",
        {
          correo: correo.trim(),
          password: password.trim(),
        }
      );

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(
          response.data.usuario
        )
      );

      await AsyncStorage.setItem(
        "token",
        response.data.token
      );

      router.replace(
        "/seleccionar-rol"
      );

    } catch (error: any) {

      console.log(
        "ERROR LOGIN:",
        error.response?.data ||
          error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.mensaje ||
          "Error de conexión"
      );
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Iniciar Sesión
      </Text>

      <TextInput
        placeholder="Correo"
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={iniciarSesion}
      >
        <Text style={styles.buttonText}>
          Ingresar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push("/register")
        }
      >
        <Text style={styles.link}>
          ¿No tienes cuenta? Regístrate
        </Text>
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
    textAlign: "center",
    marginBottom: 30,
    color: "#F06292",
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#F06292",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#F06292",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#F06292",
    fontWeight: "bold",
  },

});