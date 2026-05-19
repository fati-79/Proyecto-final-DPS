import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useLocalSearchParams, router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";

export default function AgendarCitaScreen() {
  const params = useLocalSearchParams();
  const modo = String(params.modo || "");
const citaId = String(params.cita_id || "");
const especialidadId = String(params.especialidad_id || "");

  const [doctorId, setDoctorId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivoId, setMotivoId] = useState("");

  const [motivos, setMotivos] = useState<any[]>([]);
  const [doctores, setDoctores] = useState<any[]>([]);

  const horarios = [
    { label: "8:00 AM", value: "08:00:00" },
    { label: "9:00 AM", value: "09:00:00" },
    { label: "10:00 AM", value: "10:00:00" },
    { label: "11:00 AM", value: "11:00:00" },
    { label: "12:00 PM", value: "12:00:00" },
    { label: "1:00 PM", value: "13:00:00" },
    { label: "2:00 PM", value: "14:00:00" },
    { label: "3:00 PM", value: "15:00:00" },
    { label: "4:00 PM", value: "16:00:00" },
    { label: "5:00 PM", value: "17:00:00" },
  ];

  useEffect(() => {
    cargarMotivos();
    cargarDoctores();
  }, []);

  const cargarMotivos = async () => {
    try {
      const response = await api.get("/motivos");
      setMotivos(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los motivos");
    }
  };

const cargarDoctores = async () => {
  try {
    const response = await api.get("/doctores");

    const filtrados = response.data.filter(
      (doctor: any) =>
        String(doctor.especialidad_id) === String(especialidadId)
    );

    setDoctores(filtrados);
  } catch (error) {
    console.log("Error al cargar doctores:", error);
    Alert.alert("Error", "No se pudieron cargar los doctores");
    setDoctores([]);
  }
};

 const agendarCita = async () => {
  if (!doctorId || !motivoId || !fecha || !hora) {
    Alert.alert("Error", "Todos los campos son obligatorios");
    return;
  }

  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Error", "No se encontró sesión activa");
      return;
    }

    // Validar fecha y hora pasada
    const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);
    const ahora = new Date();

    if (fechaHoraSeleccionada < ahora) {
      Alert.alert(
        "Error",
        "No puedes agendar o reprogramar una cita en una fecha u hora pasada"
      );
      return;
    }

    if (modo === "reprogramar" && citaId) {
      await api.put(
        `/citas/reprogramar/${citaId}`,
        {
          doctor_id: parseInt(doctorId),
          motivo_id: parseInt(motivoId),
          fecha,
          hora,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Éxito", "Cita reprogramada correctamente");
    } else {
      console.log("DATOS ENVIADOS:", {
  doctor_id: parseInt(doctorId),
  motivo_id: parseInt(motivoId),
  fecha,
  hora,
});
      await api.post(
        "/citas/crear",
        {
          doctor_id: parseInt(doctorId),
          motivo_id: parseInt(motivoId),
          fecha,
          hora,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Éxito", "Cita agendada correctamente");
    }

    router.replace("/mis-citas");
  } catch (error: any) {
  console.log(
    "ERROR CREAR CITA:",
    error.response?.data || error.message
  );

  Alert.alert(
    "Error",
    error.response?.data?.mensaje || "Error al crear la cita"
  );
}

};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agendar Cita</Text>

      <Text style={styles.label}>Selecciona un Doctor</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={doctorId}
          onValueChange={(itemValue) => setDoctorId(itemValue)}
        >
          <Picker.Item label="Seleccione un doctor" value="" />
          {doctores.map((doctor) => (
            <Picker.Item
              key={doctor.id}
              label={doctor.nombre}
              value={doctor.id.toString()}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Selecciona una Fecha</Text>
      <Calendar
        onDayPress={(day) => setFecha(day.dateString)}
        minDate={new Date().toISOString().split("T")[0]}
        markedDates={{
          [fecha]: {
            selected: true,
            selectedColor: "#F06292",
          },
        }}
        theme={{
          selectedDayBackgroundColor: "#F06292",
          todayTextColor: "#C2185B",
          arrowColor: "#F06292",
        }}
      />

      <Text style={styles.label}>Selecciona una Hora</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={hora}
          onValueChange={(itemValue) => setHora(itemValue)}
        >
          <Picker.Item label="Seleccione una hora" value="" />
          {horarios.map((horario, index) => (
            <Picker.Item
              key={index}
              label={horario.label}
              value={horario.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Selecciona el Motivo</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={motivoId}
          onValueChange={(itemValue) => setMotivoId(itemValue)}
        >
          <Picker.Item label="Seleccione un motivo" value="" />
          {motivos.map((motivo) => (
            <Picker.Item
              key={motivo.id}
              label={motivo.nombre}
              value={motivo.id.toString()}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={agendarCita}>
        <Text style={styles.buttonText}>Confirmar Cita</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#F06292",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C2185B",
    marginTop: 18,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#F06292",
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#F06292",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});