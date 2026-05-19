import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import api from "../services/api";

export default function AgregarDoctorScreen() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [especialidadId, setEspecialidadId] =
    useState("");
    const [password, setPassword] =
  useState("");

  const [especialidades, setEspecialidades] =
    useState<any[]>([]);

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    try {
      const response = await api.get(
        "/especialidades"
      );

      setEspecialidades(response.data);
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudieron cargar especialidades"
      );
    }
  };

  
    const guardarDoctor = async () => {

  // VALIDAR SOLO LETRAS

const regexNombre =
  /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;

if (!regexNombre.test(nombre)) {
  Alert.alert(
    "Validación",
    "El nombre solo debe contener letras"
  );
  return;
}
  // VALIDAR CORREO
  if (!correo.trim()) {
    Alert.alert(
      "Validación",
      "El correo es obligatorio"
    );
    return;
  }

  // VALIDAR FORMATO CORREO
  const regexCorreo =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexCorreo.test(correo)) {
    Alert.alert(
      "Validación",
      "Correo inválido"
    );
    return;
  }

  // VALIDAR TELÉFONO
  if (!telefono.trim()) {
    Alert.alert(
      "Validación",
      "El teléfono es obligatorio"
    );
    return;
  }

  // VALIDAR SOLO NÚMEROS
  const regexTelefono = /^[0-9]+$/;

  if (!regexTelefono.test(telefono)) {
    Alert.alert(
      "Validación",
      "El teléfono solo debe contener números"
    );
    return;
  }

  // VALIDAR LONGITUD TELÉFONO
  if (telefono.length < 8) {
    Alert.alert(
      "Validación",
      "Teléfono inválido"
    );
    return;
  }

  // VALIDAR ESPECIALIDAD
  if (!especialidadId) {
    Alert.alert(
      "Validación",
      "Debes seleccionar una especialidad"
    );
    return;
  }

  try {
    await api.post("/doctores", {
  nombre,
  correo,
  telefono,
  password,
  especialidad_id:
    parseInt(especialidadId),
});

    Alert.alert(
      "Éxito",
      "Doctor agregado correctamente"
    );

    setNombre("");
    setCorreo("");
    setTelefono("");
    setEspecialidadId("");

  } catch (error: any) {

    console.log(
      error.response?.data || error.message
    );

    Alert.alert(
      "Error",
      error.response?.data?.mensaje ||
        "No se pudo guardar doctor"
    );
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Agregar Doctor
      </Text>

      <TextInput
        placeholder="Nombre"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        placeholder="Correo"
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
      />


      <TextInput
        placeholder="Teléfono"
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
      />
      <TextInput
  placeholder="Contraseña"
  secureTextEntry
  style={styles.input}
  value={password}
  onChangeText={setPassword}
/>

      <Text style={styles.subTitle}>
        Especialidad
      </Text>

      {especialidades.map((esp) => (
        <TouchableOpacity
          key={esp.id}
          style={[
            styles.card,
            especialidadId == esp.id.toString()
              ? styles.selected
              : null,
          ]}
          onPress={() =>
            setEspecialidadId(
              esp.id.toString()
            )
          }
        >
          <Text style={styles.cardText}>
            {esp.nombre}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={guardarDoctor}
      >
        <Text style={styles.buttonText}>
          Guardar Doctor
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: "#F06292",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },

  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C2185B",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#FCE4EC",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  selected: {
    backgroundColor: "#F8BBD0",
  },

  cardText: {
    color: "#880E4F",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#F06292",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});