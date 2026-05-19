import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import api from "../services/api";

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);

  const registrarse = async () => {
    // Limpiar espacios
    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim().toLowerCase();
    const passwordLimpio = password.trim();
    const telefonoLimpio = telefono.trim();

    // Validación básica
    if (
      !nombreLimpio ||
      !correoLimpio ||
      !passwordLimpio ||
      !telefonoLimpio
    ) {
      Alert.alert(
        "Error",
        "Todos los campos son obligatorios"
      );
      return;
    }

    // Validar teléfono (8 dígitos)
    if (!/^[0-9]{8}$/.test(telefonoLimpio)) {
      Alert.alert(
        "Error",
        "El teléfono debe tener exactamente 8 números"
      );
      return;
    }

    // Validar contraseña
    if (passwordLimpio.length < 6) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/registro", {
        nombre: nombreLimpio,
        correo: correoLimpio,
        password: passwordLimpio,
        telefono: telefonoLimpio,
        rol: "paciente",
      });

      Alert.alert(
        "Éxito",
        "Usuario registrado correctamente",
        [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "ERROR REGISTRO:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.mensaje ||
          "No se pudo registrar"
      );
    } finally {
      setLoading(false);
    }
  };
 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Registro
      </Text>

      <TextInput
        placeholder="Nombre completo"
        placeholderTextColor="#999"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      

      <TextInput
  placeholder="Correo"
  style={styles.input}
  value={correo}
  onChangeText={(texto) => {
    console.log("Correo:", texto);
    setCorreo(texto);
  }}
  autoCapitalize="none"
  keyboardType="email-address"
/>

<TextInput
  placeholder="Contraseña"
  secureTextEntry
  style={styles.input}
  value={password}
  onChangeText={(texto) => {
    console.log("Password:", texto);
    setPassword(texto);
  }}
/>

      <TextInput
        placeholder="Teléfono (8 dígitos)"
        placeholderTextColor="#999"
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="numeric"
        maxLength={8}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={registrarse}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Registrarse
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/")}
      >
        <Text style={styles.login}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F06292",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#FFF",
    color: "#000",
  },
  button: {
    backgroundColor: "#F06292",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  login: {
    marginTop: 20,
    textAlign: "center",
    color: "#555",
    fontSize: 16,
  },
});