import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { router } from "expo-router";

export default function MisCitasScreen() {
  const [citas, setCitas] = useState<any[]>([]);

  const cargarCitas = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "No se encontró sesión activa");
        return;
      }

      const response = await api.get("/citas/mis-citas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCitas(response.data);
    } catch (error: any) {
      console.log("ERROR MIS CITAS:", error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.mensaje || "No se pudieron cargar las citas"
      );
    }
  };

  const cancelarCita = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "No se encontró sesión activa");
        return;
      }

      await api.put(
        `/citas/cancelar/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Éxito", "Cita cancelada correctamente");

      cargarCitas();
    } catch (error: any) {
      console.log("ERROR CANCELAR:", error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.mensaje || "No se pudo cancelar la cita"
      );
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const renderCita = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.label}>Doctor: {item.doctor}</Text>
      <Text style={styles.label}>Especialidad: {item.especialidad}</Text>
      <Text style={styles.label}>Motivo: {item.motivo}</Text>
      <Text style={styles.label}>Fecha: {item.fecha}</Text>
      <Text style={styles.label}>Hora: {item.hora}</Text>
      <Text style={styles.label}>Estado: {item.estado}</Text>

      {item.estado !== "Cancelada" && (
        <>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() =>
              Alert.alert(
                "Confirmar cancelación",
                "¿Estás segura de cancelar esta cita?",
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Sí, cancelar",
                    onPress: () => cancelarCita(item.id),
                  },
                ]
              )
            }
          >
            <Text style={styles.buttonText}>Cancelar Cita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reprogramButton}
            onPress={() =>
  router.push(
    (`/reprogramar-cita?cita_id=${item.id}`) as any
  )
}
          >
            <Text style={styles.buttonText}>Reprogramar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Citas</Text>

      <FlatList
        data={citas}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderCita}
        contentContainerStyle={
          citas.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No tienes citas registradas</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#F06292",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#F06292",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  reprogramButton: {
    marginTop: 10,
    backgroundColor: "#F06292",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
  },
});