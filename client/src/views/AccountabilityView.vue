<template>
  <div class="max-w-7xl mx-auto py-4">
    <h2 class="text-2xl font-bold text-gray-900 mb-8">Community Accountability</h2>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Report Irresponsible Pet Ownership</h3>
        <form @submit.prevent="handleOwnershipReport" class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label class="block text-sm font-medium text-gray-700 mb-2">Issue Type</label><select v-model="ownershipReport.type" class="input-field"><option value="unleashed_pet">Unleashed Pet in Public</option><option value="abandonment">Pet Abandonment</option><option value="other">Other</option></select></div>
          <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Description</label><textarea v-model="ownershipReport.description" rows="3" class="input-field" placeholder="Describe the situation..."></textarea></div>
          <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Location</label><input v-model="ownershipReport.location" type="text" class="input-field" placeholder="Street or area" /></div>
          <button type="submit" class="btn-primary">Submit Report</button>
        </form>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Community Clean-Up Initiatives</h3>
        <div class="flex justify-between items-center mb-4"><button @click="showNewCleanup = true" class="text-sm text-animal-600 font-medium hover:underline">+ Create Initiative</button></div>
        <div v-if="cleanUps.length === 0" class="text-center py-6 text-gray-500 text-sm">No clean-up initiatives yet.</div>
        <div v-else class="space-y-3"><div v-for="cu in cleanUps" :key="cu.id" class="p-3 bg-gray-50 rounded-lg border border-gray-100"><div class="flex justify-between items-start mb-1"><h4 class="font-medium text-gray-900 text-sm">{{ cu.title }}</h4><span class="text-xs font-bold px-2 py-0.5 rounded" :class="cu.status === 'planned' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">{{ cu.status }}</span></div><p class="text-xs text-gray-600 mb-2">{{ cu.description }}</p><div class="flex items-center gap-3 text-xs text-gray-500"><span>📍 {{ cu.location }}</span><span>•</span><span>👥 {{ cu.volunteers_joined }}/{{ cu.volunteers_needed }} volunteers</span></div></div></div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Secure Waste Bins (Food Source Control)</h3>
      <p class="text-sm text-gray-600 mb-4">Closed, secure waste bins cut off food sources that attract street animal packs into residential areas.</p>
      <div class="flex items-center gap-4 mb-4"><label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" v-model="wasteFilter.secure_only" class="rounded text-animal-600" /> Secure bins only</label></div>
      <div v-if="wasteBins.length === 0" class="text-center py-6 text-gray-500 text-sm">No waste bins reported yet.</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><div v-for="wb in wasteBins" :key="wb.id" class="p-3 rounded-lg border" :class="wb.is_secure ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'"><div class="flex justify-between items-start mb-2"><span class="text-xs font-bold" :class="wb.is_secure ? 'text-green-700' : 'text-orange-700'">{{ wb.is_secure ? "✓ Secure" : "⚠ Open" }}</span></div><p class="text-xs text-gray-600">{{ wb.notes || "Municipal waste bin" }}</p></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { incidentAPI, cleanupAPI, wastebinAPI } from "@/api";

const auth = useAuthStore();
const ownershipReport = ref({ type: "unleashed_pet", description: "", location: "" });
const showNewCleanup = ref(false);
const cleanUps = ref([]);
const wasteBins = ref([]);
const wasteFilter = ref({ secure_only: false });

onMounted(async () => { await loadCleanUps(); await loadWasteBins(); });

async function loadCleanUps() {
  try { const res = await cleanupAPI.list({}); cleanUps.value = res.data.initiatives; } catch (err) { console.error("Failed to load clean-ups:", err); }
}

async function loadWasteBins() {
  try { const res = await wastebinAPI.list({}); wasteBins.value = wasteFilter.value.secure_only ? res.data.waste_bins.filter((b) => b.is_secure) : res.data.waste_bins; } catch (err) { console.error("Failed to load waste bins:", err); }
}

async function handleOwnershipReport() {
  if (!auth.user) { alert("Please log in to submit a report"); return; }
  try {
    await incidentAPI.create({ type: ownershipReport.value.type, latitude: 0, longitude: 0, description: ownershipReport.value.description, severity: "medium" });
    ownershipReport.value = { type: "unleashed_pet", description: "", location: "" };
    alert("Report submitted successfully");
  } catch (err) { alert(err.response?.data?.error || "Failed to submit report"); }
}
</script>