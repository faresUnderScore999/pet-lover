import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getReports: () => api.get("/users/reports"),
  getAnimals: () => api.get("/users/animals"),
};

export const incidentAPI = {
  create: (data) => api.post("/incidents", data),
  list: (params) => api.get("/incidents", { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  updateStatus: (id, status) => api.patch(`/incidents/${id}/status`, { status }),
};

export const safetyAPI = {
  create: (data) => api.post("/safety", data),
  list: (params) => api.get("/safety", { params }),
};

export const animalAPI = {
  create: (data) => api.post("/animals", data),
  list: (params) => api.get("/animals", { params }),
  getById: (id) => api.get(`/animals/${id}`),
  updateStatus: (id, status) => api.patch(`/animals/${id}/status`, { adoption_status: status }),
};

export const tnrAPI = {
  create: (data) => api.post("/tnr", data),
  list: (params) => api.get("/tnr", { params }),
  getById: (id) => api.get(`/tnr/${id}`),
  update: (id, data) => api.patch(`/tnr/${id}`, data),
};

export const donationAPI = {
  create: (data) => api.post("/donations", data),
  list: (params) => api.get("/donations", { params }),
};

export const cleanupAPI = {
  create: (data) => api.post("/cleanup", data),
  list: (params) => api.get("/cleanup", { params }),
};

export const wastebinAPI = {
  create: (data) => api.post("/wastebins", data),
  list: (params) => api.get("/wastebins", { params }),
};

export default api;