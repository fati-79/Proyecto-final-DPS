import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

import api from "../services/api";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TodasCitasScreen() {

  const [citas, setCitas] =
    useState<any[]>([]);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const response = await api.get(
        "/citas/todas",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setCitas(response.data);

    } catch (error) {

      Alert.alert(
        "Error",
        "No se pudieron cargar las citas"
      );
    }
  };

  const cancelarCita = async (
    id: number
  ) => {

    try {

      const token =
        await AsyncStorage.getItem(
          "token"
        );

      await api.put(
        `/citas/cancelar/${id}`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Éxito",
        "Cita cancelada"
      );

      setCitas((prev) =>
        prev.map((cita) => {

          if (cita.id === id) {

            return {
              ...cita,
              estado: "cancelada",
            };
          }

          return cita;
        })
      );

    } catch (error) {

      Alert.alert(
        "Error",
        "No se pudo cancelar"
      );
    }
  };

  const renderItem = ({ item }: any) => (

    <View style={styles.card}>

      <Text style={styles.nombre}>
        {item.paciente}
      </Text>

      <Text style={styles.text}>
        Doctor: {item.doctor}
      </Text>

      <Text style={styles.text}>
        Especialidad:
        {" "}
        {item.especialidad}
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

      {item.estado !== "cancelada" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            Alert.alert(
              "Confirmar",
              "¿Deseas cancelar esta cita?",
              [
                {
                  text: "No",
                  style: "cancel",
                },
                {
                  text: "Sí",
                  onPress: () =>
                    cancelarCita(item.id),
                },
              ]
            )
          }
        >
          <Text style={styles.buttonText}>
            Cancelar
          </Text>
        </TouchableOpacity>
      )}

    </View>
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Todas las Citas
      </Text>

      <FlatList
        data={citas}
        keyExtractor={(item) =>
          item.id.toString()
        }
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#FCE4EC",
    padding: 18,
    borderRadius: 15,
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
    marginTop: 10,
  },

  cancelButton: {
    backgroundColor: "#C2185B",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },

});