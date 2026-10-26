<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-animal-600">📍</span> Report an Incident
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
            <select v-model="form.type" class="input-field">
              <option value="stray_pack">Stray Animal Pack</option>
              <option value="injured_animal">Injured or Sick Animal</option>
              <option value="trash_bin">Overflowing Trash Bin</option>
              <option value="unleashed_pet">Unleashed Pet in Public</option>
              <option value="abandonment">Pet Abandonment</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select v-model="form.severity" class="input-field">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea v-model="form.description" rows="4" class="input-field" placeholder="Describe what you see..."></textarea>
        </div>

        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
          <p class="text-sm text-blue-800 mb-2">
            <strong class="font-bold">📍 Location:</strong> Click on the map below to set the location, or allow browser location.
          </p>
          <button type="button" @click="useMyLocation" class="text-blue-600 text-sm font-medium hover:underline">Use my current location</button>
        </div>

        <div ref="mapRef" class="h-64 rounded-xl border border-gray-200 mb-4" id="report-map"></div>

        <div v-if="coordinatesSelected" class="flex items-center gap-3 text-sm text-animal-600 mb-4">
          <span class="text-animal-600">✓</span>
          <span>Location set: {{ form.latitude.toFixed(4) }}, {{ form.longitude.toFixed(4) }}</span>
        </div>

        <button
          type="submit"
          :disabled="!coordinatesSelected || loading"
          class="btn-primary w-full md:w-auto py-3"
        >
          {{ loading ? "Submitting..." : "Submit Report" }}
        </button>
      </form>
    </div>

    <div v-if="submitted" class="bg-animal-50 border border-animal-200 rounded-xl p-6 text-center">
      <div class="text-animal-600 text-4xl mb-3">✅</div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
      <p class="text-gray-600 mb-4">Thank you for helping keep our community safe for both people and animals.</p>
      <router-link to="/" class="btn-primary">Return to Home</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { incidentAPI } from "@/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const auth = useAuthStore();
const mapRef = ref(null);
const map = ref(null);
const marker = ref(null);
const coordinatesSelected = ref(false);
const loading = ref(false);
const submitted = ref(false);

const form = ref({
  type: "stray_pack",
  severity: "medium",
  description: "",
  latitude: null,
  longitude: null,
});

// Default center: Tunis, Tunisia
const DEFAULT_CENTER = [36.8065, 10.1815];

const CUSTOM_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

onMounted(() => {
  map.value = L.map("report-map", {
    center: DEFAULT_CENTER,
    zoom: 13,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map.value);

  marker.value = L.marker(DEFAULT_CENTER, { draggable: true, icon: CUSTOM_ICON }).addTo(map.value);

  marker.value.on("dragend", (e) => {
    const pos = e.target.getLatLng();
    form.value.latitude = pos.lat;
    form.value.longitude = pos.lng;
    coordinatesSelected.value = true;
  });

  map.value.on("click", (e) => {
    marker.value.setLatLng(e.latlng);
    form.value.latitude = e.latlng.lat;
    form.value.longitude = e.latlng.lng;
    coordinatesSelected.value = true;
  });
});

function useMyLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      form.value.latitude = latitude;
      form.value.longitude = longitude;
      coordinatesSelected.value = true;
      map.value.setView([latitude, longitude], 15);
      marker.value.setLatLng([latitude, longitude]);
    },
    () => {
      alert("Unable to retrieve your location");
    }
  );
}

async function handleSubmit() {
  if (!auth.user) {
    alert("Please log in to submit a report");
    return;
  }
  loading.value = true;
  try {
    await incidentAPI.create({
      type: form.value.type,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      description: form.value.description,
      severity: form.value.severity,
    });
    submitted.value = true;
  } catch (err) {
    alert(err.response?.data?.error || "Failed to submit report");
  } finally {
    loading.value = false;
  }
}
</script>