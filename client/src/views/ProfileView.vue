<template>
  <div class="max-w-4xl mx-auto py-4">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
        <div class="w-24 h-24 bg-animal-100 rounded-full flex items-center justify-center text-animal-600 text-4xl shrink-0">
          👤
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ user.full_name || "User" }}</h2>
          <p class="text-animal-600 font-medium">{{ user.role }}</p>
          <p class="text-gray-600 text-sm mt-1">{{ user.city }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-4 bg-gray-50 rounded-xl">
          <div class="text-xs font-medium text-gray-500 uppercase">Reports Submitted</div>
          <div class="text-2xl font-bold text-gray-900">{{ user.reports_count }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-xl">
          <div class="text-xs font-medium text-gray-500 uppercase">Animals Listed</div>
          <div class="text-2xl font-bold text-gray-900">{{ user.animals_listed }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-xl">
          <div class="text-xs font-medium text-gray-500 uppercase">Member Since</div>
          <div class="text-2xl font-bold text-gray-900">{{ formatDate(user.created_at) }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">My Reports</h3>
        <div v-if="myReports.length === 0" class="text-center py-6 text-gray-500 text-sm">
          No reports yet.
        </div>
        <div v-else class="space-y-3">
          <div v-for="r in myReports" :key="r.id" class="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-medium text-gray-900 text-sm">{{ incidentTypeLabel(r.type) }}</h4>
              <span class="text-xs font-bold px-2 py-0.5 rounded" :class="statusColor(r.status)">
                {{ r.status }}
              </span>
            </div>
            <p class="text-xs text-gray-600">{{ r.description }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">My Listed Animals</h3>
        <div v-if="myAnimals.length === 0" class="text-center py-6 text-gray-500 text-sm">
          No animals listed yet.
        </div>
        <div v-else class="space-y-3">
          <div v-for="a in myAnimals" :key="a.id" class="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <h4 class="font-medium text-gray-900 text-sm">{{ a.name || "Unnamed" }}</h4>
            <p class="text-xs text-gray-600">{{ a.species }} • {{ a.adoption_status }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { userAPI } from "@/api";

const auth = useAuthStore();
const myReports = ref([]);
const myAnimals = ref([]);

onMounted(async () => {
  try {
    const [repRes, animRes] = await Promise.all([
      userAPI.getReports(),
      userAPI.getAnimals(),
    ]);
    myReports.value = repRes.data.reports;
    myAnimals.value = animRes.data.animals;
  } catch (err) {
    console.error("Failed to load profile data:", err);
  }
});

function incidentTypeLabel(type) {
  const labels = {
    stray_pack: "Stray Pack",
    injured_animal: "Injured Animal",
    trash_bin: "Trash Bin",
    unleashed_pet: "Unleashed Pet",
    abandonment: "Abandonment",
  };
  return labels[type] || type;
}

function statusColor(status) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    verified: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-gray-100 text-gray-700",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ar-TN");
}
</script>