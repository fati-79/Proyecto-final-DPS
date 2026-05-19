import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";

import api from "../services/api";

export default function GestionarEspecialidadesScreen() {
  const [especialidades, setEspecialidades] =
    useState<any[]>([]);

  const [nombre, setNombre] = useState("");

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
        "No se pudieron cargar"
      );
    }
  };

  const agregarEspecialidad = async () => {
  // validar vacío
  if (!nombre.trim()) {
    Alert.alert(
      "Validación",
      "Debes escribir una especialidad"
    );

    return;
  }

  // validar mínimo caracteres
  if (nombre.trim().length < 3) {
    Alert.alert(
      "Validación",
      "La especialidad es muy corta"
    );

    return;
  }

  try {
    await api.post("/especialidades", {
      nombre: nombre.trim(),
    });

    setNombre("");

    Alert.alert(
      "Éxito",
      "Especialidad agregada"
    );

    cargarEspecialidades();
  } catch (error: any) {
    console.log(error.response?.data);

    Alert.alert(
      "Error",
      "No se pudo agregar"
    );
  }
};

  const eliminarEspecialidad = async (
    id: number
  ) => {
    try {
      await api.delete(
        `/especialidades/${id}`
      );

      Alert.alert(
        "Éxito",
        "Especialidad eliminada"
      );

      cargarEspecialidades();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo eliminar"
      );
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>
        {item.nombre}
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            "Confirmar",
            "¿Eliminar especialidad?",
            [
              {
                text: "No",
                style: "cancel",
              },
              {
                text: "Sí",
                onPress: () =>
                  eliminarEspecialidad(item.id),
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
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Especialidades
      </Text>

      <TextInput
        placeholder="Nueva especialidad"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={agregarEspecialidad}
      >
        <Text style={styles.buttonText}>
          Agregar Especialidad
        </Text>
      </TouchableOpacity>

      <FlatList
        data={especialidades}
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

  input: {
    borderWidth: 1,
    borderColor: "#F06292",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C2185B",
  },

  deleteButton: {
    backgroundColor: "#C2185B",
    padding: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});