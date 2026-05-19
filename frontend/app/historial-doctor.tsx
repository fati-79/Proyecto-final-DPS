import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function HistorialDoctorScreen() {
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await api.get(
        "/citas/historial-doctor",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistorial(response.data);
    } catch (error: any) {
      console.log(
        "ERROR HISTORIAL:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        "No se pudo cargar el historial"
      );
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>
        {item.paciente_nombre}
      </Text>

      <Text style={styles.text}>
        Motivo: {item.motivo_nombre}
      </Text>

      <Text style={styles.text}>
        Fecha: {item.fecha}
      </Text>

      <Text style={styles.text}>
        Hora: {item.hora}
      </Text>

      <Text style={styles.estado}>
        Estado: {item.estado}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Historial Médico
      </Text>

      <FlatList
        data={historial}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },

  card: {
    backgroundColor: "#FCE4EC",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C2185B",
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    marginBottom: 5,
  },

  estado: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#880E4F",
    marginTop: 5,
  },
});