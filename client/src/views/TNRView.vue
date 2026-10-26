<template>
  <div class="max-w-7xl mx-auto py-4">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">TNR Coordination Hub</h2>
        <p class="text-gray-600">Trap-Neuter-Return & medical coordination for street animals</p>
      </div>
      <button @click="showNewCase = true" class="btn-primary px-6 py-3">New TNR Case</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card"><div class="text-3xl font-bold text-animal-600">{{ stats.total }}</div><p class="text-gray-600 text-sm">Total TNR Cases</p></div>
      <div class="card"><div class="text-3xl font-bold text-blue-600">{{ stats.requested }}</div><p class="text-gray-600 text-sm">Pending Requests</p></div>
      <div class="card"><div class="text-3xl font-bold text-green-600">{{ stats.completed }}</div><p class="text-gray-600 text-sm">Completed Procedures</p></div>
    </div>

    <div v-if="showNewCase" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Create New TNR Case</h3>
      <form @submit.prevent="createTNRCase" class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Animal Name / Description</label><input v-model="newCase.animal_name" type="text" class="input-field" placeholder="e.g., Ginger cat at Avenue Habib Bourguiba" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-2">Species</label><select v-model="newCase.species" class="input-field"><option value="dog">Dog</option><option value="cat">Cat</option></select></div>
        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Location</label><input v-model="newCase.location" type="text" class="input-field" placeholder="Street address or area" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (TND)</label><input v-model="newCase.estimated_cost" type="number" class="input-field" placeholder="150" /></div>
        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Notes</label><textarea v-model="newCase.notes" rows="3" class="input-field" placeholder="Any special medical notes..."></textarea></div>
        <div class="md:col-span-2"><button type="submit" class="btn-primary">Create TNR Case</button><button type="button" @click="showNewCase = false" class="btn-secondary ml-2">Cancel</button></div>
      </form>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-200"><h3 class="text-lg font-bold text-gray-900">Active TNR Cases</h3></div>
      <div v-if="tnrCases.length === 0" class="p-8 text-center text-gray-500">No TNR cases yet. Create one to get started.</div>
      <table v-else class="w-full text-left">
        <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Animal</th><th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rescuer</th><th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th><th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Est. Cost (TND)</th><th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
        <tbody class="divide-y divide-gray-200"><tr v-for="caseItem in tnrCases" :key="caseItem.id" class="hover:bg-gray-50 transition-colors"><td class="px-6 py-4"><div class="font-medium text-gray-900">{{ caseItem.animal_name || "Unnamed Animal" }}</div><div class="text-xs text-gray-500">{{ caseItem.animal_species }}</div></td><td class="px-6 py-4 text-gray-700">{{ caseItem.rescuer_name }}</td><td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-bold uppercase" :class="statusColor(caseItem.status)">{{ caseItem.status }}</span></td><td class="px-6 py-4 text-gray-700">{{ caseItem.estimated_cost || "-" }}</td><td class="px-6 py-4"><router-link :to="`/tnr/${caseItem.id}`" class="text-animal-600 text-sm font-medium hover:underline">View Details</router-link></td></tr></tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { tnrAPI } from "@/api";

const auth = useAuthStore();
const showNewCase = ref(false);
const tnrCases = ref([]);
const newCase = ref({ animal_name: "", species: "cat", location: "", estimated_cost: "", notes: "" });
const stats = ref({ total: 0, requested: 0, completed: 0 });

onMounted(() => { loadCases(); });

async function loadCases() {
  try {
    const res = await tnrAPI.list({});
    tnrCases.value = res.data.tnr_cases;
    stats.value = { total: tnrCases.value.length, requested: tnrCases.value.filter((c) => c.status === "requested").length, completed: tnrCases.value.filter((c) => c.status === "completed").length };
  } catch (err) { console.error("Failed to load TNR cases:", err); }
}

async function createTNRCase() {
  if (!auth.user) { alert("Please log in to create a TNR case"); return; }
  try {
    await tnrAPI.create({ animal_id: null, association_id: null, vet_id: null, procedure_date: null, estimated_cost: newCase.value.estimated_cost || null, notes: newCase.value.notes });
    showNewCase.value = false;
    newCase.value = { animal_name: "", species: "cat", location: "", estimated_cost: "", notes: "" };
    loadCases();
  } catch (err) { alert(err.response?.data?.error || "Failed to create TNR case"); }
}

function statusColor(status) {
  const colors = { requested: "bg-yellow-100 text-yellow-700", scheduled: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-700" };
  return colors[status] || "bg-gray-100 text-gray-600";
}
</script>