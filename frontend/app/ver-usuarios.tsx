import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";

import api from "../services/api";

export default function VerUsuariosScreen() {

  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {

      const response = await api.get("/usuarios");

      setUsuarios(response.data);

    } catch (error) {

      Alert.alert(
        "Error",
        "No se pudieron cargar los usuarios"
      );
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>

      <Text style={styles.nombre}>
        {item.nombre}
      </Text>

      <Text style={styles.text}>
        Correo: {item.correo}
      </Text>

      <Text style={styles.rol}>
        Rol: {item.rol}
      </Text>

    </View>
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Personas Registradas
      </Text>

      <FlatList
        data={usuarios}
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
    marginBottom: 8,
  },

  text: {
    fontSize: 16,
    marginBottom: 5,
  },

  rol: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#880E4F",
    marginTop: 5,
  },

});