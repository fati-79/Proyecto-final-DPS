import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { router } from "expo-router";

export default function CitasHoyScreen() {
  const [citas, setCitas] = useState<any[]>([]);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await api.get("/citas/doctor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCitas(response.data);
    } catch (error: any) {
      console.log(
        "ERROR CARGAR CITAS:",
        error.response?.data || error.message
      );

      Alert.alert("Error", "No se pudieron cargar las citas");
    }
  };

  const cancelarCita = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await api.put(
        `/citas/cancelar/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Éxito", "Cita cancelada");
      cargarCitas();
    } catch (error: any) {
      console.log(
        "ERROR CANCELAR:",
        error.response?.data || error.message
      );

      Alert.alert("Error", "No se pudo cancelar");
    }
  };

  const reprogramarCita = (id: number) => {
  router.push(`/reprogramar-cita?id=${id}` as any);
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

     <TouchableOpacity
  style={styles.button}
  onPress={() => reprogramarCita(item.id)}
>
  <Text style={styles.buttonText}>
    Reprogramar
  </Text>
</TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
         onPress={() =>
  Alert.alert(
    "Confirmar cancelación",
    "¿Deseas cancelar esta cita?",
    [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Sí",
        onPress: () => cancelarCita(item.id),
      },
    ]
  )
}
      >
        <Text style={styles.buttonText}>
          Cancelar
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Agenda</Text>

      <FlatList
        data={citas}
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
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#F06292",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#d81b60",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});