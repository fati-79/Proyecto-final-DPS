import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function HomeScreen() {
  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("usuario");
    await AsyncStorage.removeItem("token");
    

    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a MediConnect</Text>

      <Text style={styles.subtitle}>
        Has iniciado sesión correctamente.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={cerrarSesion}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F06292",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#F06292",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});