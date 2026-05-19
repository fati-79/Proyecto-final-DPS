import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import {
  useLocalSearchParams,
  router,
} from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function ReprogramarCitaScreen() {
  const { id } = useLocalSearchParams();

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const reprogramar = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      console.log("ID:", id);

      await api.put(
        `/citas/reprogramar/${id}`,
        {
          fecha,
          hora,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Éxito",
        "Cita reprogramada correctamente"
      );

      router.back();
    } catch (error: any) {
      console.log(
        "ERROR REPROGRAMAR:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.mensaje ||
          "No se pudo reprogramar"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Reprogramar Cita
      </Text>

      <TextInput
        placeholder="Nueva fecha (YYYY-MM-DD)"
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
      />

      <TextInput
        placeholder="Nueva hora (HH:MM:SS)"
        style={styles.input}
        value={hora}
        onChangeText={setHora}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={reprogramar}
      >
        <Text style={styles.buttonText}>
          Guardar Cambios
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginBottom: 30,
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
    fontWeight: "bold",
    fontSize: 18,
  },
});