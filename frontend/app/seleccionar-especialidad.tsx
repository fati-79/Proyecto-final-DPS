import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import api from "../services/api";


export default function SeleccionarEspecialidadScreen() {
  const [especialidades, setEspecialidades] = useState<any[]>([]);

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    try {
      const response = await api.get("/especialidades");
      setEspecialidades(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las especialidades");
    }
  };
const seleccionarEspecialidad = (especialidad: any) => {
  router.push(
    (`/agendar-citas?especialidad_id=${especialidad.id}`) as any
  );
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selecciona una Especialidad</Text>

      <View style={styles.grid}>
        {especialidades.length > 0 ? (
          especialidades.map((especialidad) => (
            <TouchableOpacity
              key={especialidad.id}
              style={styles.card}
              onPress={() => seleccionarEspecialidad(especialidad)}
            >
              <Text style={styles.cardText}>{especialidad.nombre}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>
            No hay especialidades disponibles
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginBottom: 35,
    marginTop: 30,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FCE4EC",
    borderWidth: 1,
    borderColor: "#F8BBD0",
    borderRadius: 15,
    paddingVertical: 30,
    paddingHorizontal: 10,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#C2185B",
  },
  noData: {
    width: "100%",
    textAlign: "center",
    fontSize: 18,
    color: "#777",
    marginTop: 20,
  },
});