<template>
  <div class="relative isolate w-full min-w-0 flex-1 flex flex-col min-h-0">
    <div class="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
      <div class="relative">
        <input v-model="searchQuery" type="text" placeholder="Search locations..." class="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-animal-500" />
        <span class="absolute left-3 top-3 text-gray-400">🔍</span>
      </div>
      <button @click="showFilters = !showFilters" class="px-4 py-3 bg-animal-600 text-white rounded-lg font-medium hover:bg-animal-700 text-sm">{{ showFilters ? "Hide Filters" : "Filters" }}</button>
      <button @click="useMyLocation" class="px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 text-sm">📍 My Location</button>
    </div>

    <div v-if="showFilters" class="absolute top-20 left-4 right-4 z-20 bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-md">
      <h3 class="font-bold text-gray-900 mb-4">Filter by Type</h3>
      <div class="grid grid-cols-2 gap-3 mb-6">
        <label v-for="(label, key) in incidentTypes" :key="key" class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" :value="key" v-model="selectedTypes" class="rounded text-animal-600 focus:ring-animal-500" />
          <span class="text-sm text-gray-700">{{ label }}</span>
        </label>
      </div>
      <button @click="showFilters = false" class="w-full py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Close Filters</button>
    </div>

    <div ref="mapContainer" class="w-full min-w-0 flex-1 relative z-0" id="main-map"></div>

    <div v-if="selectedIncident" class="absolute bottom-4 left-4 right-4 z-20 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-lg transform transition-all duration-300">
      <div class="flex justify-between items-start mb-2">
        <div>
          <span class="px-2 py-1 rounded-full text-xs font-bold uppercase" :class="severityColor">{{ selectedIncident.severity }}</span>
          <h3 class="text-lg font-bold text-gray-900 mt-1">{{ incidentTypeLabel(selectedIncident.type) }}</h3>
        </div>
        <button @click="selectedIncident = null" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <p class="text-gray-600 text-sm mb-4">{{ selectedIncident.description }}</p>
      <div class="flex items-center gap-3 text-xs text-gray-500 mb-4"><span>📅 {{ formatDate(selectedIncident.created_at) }}</span><span>•</span><span>Status: {{ selectedIncident.status }}</span></div>
      <div class="flex gap-2"><button class="flex-1 py-2 bg-animal-600 text-white rounded-lg text-sm font-medium">Mark Resolved</button><button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Share</button></div>
    </div>

    <button @click="router.push('/report')" class="fixed bottom-6 right-6 bg-animal-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-animal-700 transition-all z-30"><span class="text-2xl">+</span></button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useIncidentsStore } from "@/stores/incidents";
import { useSafetyStore } from "@/stores/safety";
import { incidentAPI, safetyAPI } from "@/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const router = useRouter();
const incidentsStore = useIncidentsStore();
const safetyStore = useSafetyStore();
const mapContainer = ref(null);
const map = ref(null);
const markers = ref([]);
const selectedIncident = ref(null);
const showFilters = ref(false);
const searchQuery = ref("");
const selectedTypes = ref([]);

console.log("[MapView] Script setup: stores initialized, refs created");

const DEFAULT_CENTER = [36.8065, 10.1815];
const incidentTypes = { stray_pack: "Stray Pack", injured_animal: "Injured Animal", trash_bin: "Trash Bin", unleashed_pet: "Unleashed Pet", abandonment: "Abandonment" };

const severityColor = computed(() => {
  if (!selectedIncident.value) return "bg-gray-100 text-gray-600";
  const colors = { low: "bg-green-100 text-green-600", medium: "bg-yellow-100 text-yellow-600", high: "bg-orange-100 text-orange-600", critical: "bg-red-100 text-red-600" };
  return colors[selectedIncident.value.severity] || "bg-gray-100 text-gray-600";
});

function incidentTypeLabel(type) { return incidentTypes[type] || type; }
function formatDate(dateStr) { return new Date(dateStr).toLocaleDateString("ar-TN", { day: "numeric", month: "short", year: "numeric" }); }

async function loadData() {
  console.log("[MapView] loadData() called");
  try {
    console.log("[MapView] Fetching incidents and safety flags...");
    const [incRes, safetyRes] = await Promise.all([
      incidentAPI.list({}),
      safetyAPI.list({}),
    ]);
    console.log("[MapView] Incidents API response:", incRes.data.incidents.length, "items");
    console.log("[MapView] Safety flags API response:", safetyRes.data.flags.length, "items");
    incidentsStore.setIncidents(incRes.data.incidents);
    safetyStore.setFlags(safetyRes.data.flags);
    console.log("[MapView] Stores updated, calling renderMarkers()");
    renderMarkers();
  } catch (err) {
    console.error("[MapView] Failed to load map data:", err);
  }
}

function renderMarkers() {
  console.log("[MapView] renderMarkers() called");
  console.log("[MapView] Map object exists:", !!map.value);
  console.log("[MapView] Map container element:", mapContainer.value);
  if (mapContainer.value) {
    console.log("[MapView] Container offsetHeight:", mapContainer.value.offsetHeight);
    console.log("[MapView] Container offsetWidth:", mapContainer.value.offsetWidth);
  }

  if (!map.value) {
    console.error("[MapView] Cannot render markers: map.value is null/undefined");
    return;
  }

  markers.value.forEach((m) => map.value.removeLayer(m));
  markers.value = [];
  const filterTypes =
    selectedTypes.value.length > 0 ? selectedTypes.value : Object.keys(incidentTypes);
  const query = searchQuery.value.toLowerCase();

  console.log("[MapView] Filter types:", filterTypes);
  console.log("[MapView] Search query:", query);

  let incidentCount = 0;
  incidentsStore.incidents.forEach((inc) => {
    if (!filterTypes.includes(inc.type)) return;
    if (query && !inc.description.toLowerCase().includes(query)) return;

    console.log("[MapView] Creating marker:", inc.type, inc.latitude, inc.longitude);
    const marker = L.marker([inc.latitude, inc.longitude], {
      icon: CUSTOM_ICONS[inc.type] || CUSTOM_ICONS.stray_pack,
    }).addTo(map.value);
    marker.on("click", () => {
      selectedIncident.value = inc;
      map.value.flyTo([inc.latitude, inc.longitude], 15);
    });
    markers.value.push(marker);
    incidentCount++;
  });

  let flagCount = 0;
  safetyStore.flags.forEach((flag) => {
    const color =
      flag.type === "active_pack"
        ? "#ef4444"
        : flag.type === "unlit_area"
        ? "#f59e0b"
        : "#10b981";
    const circle = L.circle([flag.latitude, flag.longitude], {
      radius: flag.radius_meters || 100,
      color: color,
      fillColor: color,
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(map.value);
    circle.bindPopup(
      `<b>${flag.type}</b><br>${new Date(flag.created_at).toLocaleDateString()}`
    );
    markers.value.push(circle);
    flagCount++;
  });

  console.log("[MapView] Render complete:", incidentCount, "incidents,", flagCount, "flags");
}

function useMyLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => { map.value.flyTo([pos.coords.latitude, pos.coords.longitude], 15); });
}

const CUSTOM_ICONS = {
  stray_pack: L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] }),
  injured_animal: L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] }),
  trash_bin: L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] }),
  unleashed_pet: L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] }),
  abandonment: L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] }),
};

onMounted(() => {
  console.log("[MapView] onMounted() started");
  console.log("[MapView] mapContainer ref:", mapContainer.value);
  console.log("[MapView] Leaflet L object:", typeof L);

  if (!mapContainer.value) {
    console.error("[MapView] mapContainer ref is null! Map will not render.");
    return;
  }

  console.log("[MapView] Creating L.map instance...");
  map.value = L.map("main-map", { center: DEFAULT_CENTER, zoom: 12 });
  console.log("[MapView] L.map created:", !!map.value);

  console.log("[MapView] Adding tile layer...");
  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap contributors" }
  ).addTo(map.value);
  console.log("[MapView] Tile layer added");

  console.log("[MapView] Calling invalidateSize()...");
  map.value.invalidateSize();

  console.log("[MapView] Calling loadData()...");
  loadData();
});

onUnmounted(() => {
  console.log("[MapView] onUnmounted() - cleaning up map");
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
  markers.value = [];
});
</script>