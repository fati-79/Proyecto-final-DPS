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

import {
  useLocalSearchParams,
  router,
} from "expo-router";

import api from "../services/api";

export default function EditarDoctorScreen() {
  const {
    id,
    nombreActual,
    correoActual,
    telefonoActual,
  } = useLocalSearchParams();

  const [nombre, setNombre] = useState(
    nombreActual as string
  );

  const [correo, setCorreo] = useState(
    correoActual as string
  );

  const [telefono, setTelefono] = useState(
    telefonoActual as string
  );

  const actualizarDoctor = async () => {

  // VALIDAR NOMBRE
  if (!nombre.trim()) {
    Alert.alert(
      "Validación",
      "El nombre es obligatorio"
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

  // VALIDAR LONGITUD
  if (telefono.length < 8) {
    Alert.alert(
      "Validación",
      "Teléfono inválido"
    );
    return;
  }

  try {

    await api.put(`/doctores/${id}`, {
      nombre: nombre.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
    });

    Alert.alert(
      "Éxito",
      "Doctor actualizado"
    );

    router.back();

  } catch (error: any) {

    console.log(
      error.response?.data || error.message
    );

    Alert.alert(
      "Error",
      error.response?.data?.mensaje ||
        "No se pudo actualizar"
    );
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Editar Doctor
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

      <TouchableOpacity
        style={styles.button}
        onPress={actualizarDoctor}
      >
        <Text style={styles.buttonText}>
          Guardar Cambios
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

  button: {
    backgroundColor: "#F06292",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});