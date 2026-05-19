import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function GestionarUsuariosScreen() {
  const [doctores, setDoctores] = useState<any[]>([]);

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await api.get("/doctores", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDoctores(response.data);
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudieron cargar los doctores"
      );
    }
  };

    const eliminarDoctor = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");

    await api.delete(`/doctores/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    Alert.alert(
      "Éxito",
      "Doctor eliminado correctamente"
    );

    setDoctores((prev) =>
      prev.filter(
        (doctor) => doctor.id !== id
      )
    );
  } catch (error) {
    Alert.alert(
      "Error",
      "No se pudo eliminar el doctor"
    );
  }
};


  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>
        {item.nombre}
      </Text>

      <Text style={styles.especialidad}>
        {item.especialidad}
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
  style={styles.editButton}
  onPress={() =>
    router.push(
      `/editar-doctor?id=${item.id}&nombreActual=${item.nombre}&correoActual=${item.correo}&telefonoActual=${item.telefono}` as any
    )
  }
>
  <Text style={styles.buttonText}>
    Editar
  </Text>
</TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert(
              "Confirmar",
              "¿Deseas eliminar este doctor?",
              [
                {
                  text: "No",
                  style: "cancel",
                },
                {
                  text: "Sí",
                  onPress: () =>
                    eliminarDoctor(item.id),
                },
              ]
            )
          }
        >
          <Text style={styles.buttonText}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Gestionar Doctores
      </Text>

      <TouchableOpacity
  style={styles.addButton}
  onPress={() =>
    router.push("/agregar-doctor")
  }
>
        <Text style={styles.buttonText}>
          Agregar Doctor
        </Text>
      </TouchableOpacity>

      <FlatList
        data={doctores}
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 25,
  },

  addButton: {
    backgroundColor: "#F06292",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
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
  },

  especialidad: {
    fontSize: 16,
    color: "#880E4F",
    marginTop: 5,
    marginBottom: 15,
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  editButton: {
    backgroundColor: "#F06292",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#C2185B",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});