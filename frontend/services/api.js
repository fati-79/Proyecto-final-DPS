import axios from "axios";

const api = axios.create({
 baseURL: "http://192.168.1.172:3000"
});

export default api;