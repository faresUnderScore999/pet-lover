<template>
  <div class="max-w-7xl mx-auto py-4">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Adoption & Foster</h2>
        <p class="text-gray-600">Give a rescued animal a loving home or temporary foster care</p>
      </div>
      <button @click="showNewListing = true" class="btn-primary px-6 py-3">List an Animal</button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <select v-model="filters.species" class="input-field" style="min-width: 150px">
        <option value="">All Species</option>
        <option value="dog">Dogs</option>
        <option value="cat">Cats</option>
      </select>
      <select v-model="filters.status" class="input-field" style="min-width: 180px">
        <option value="available">Available for Adoption</option>
        <option value="fostered">Fostered</option>
        <option value="adopted">Adopted</option>
      </select>
    </div>

    <!-- Animals Grid -->
    <div v-if="animals.length === 0" class="text-center py-16 text-gray-500">
      <div class="text-4xl mb-4">🐾</div>
      <p>No animals match your filters.</p>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimalCard v-for="animal in animals" :key="animal.id" :animal="animal" clickable />
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import { useAnimalsStore } from "@/stores/animals";
import { animalAPI } from "@/api";
import AnimalCard from "@/components/AnimalCard.vue";

const animalsStore = useAnimalsStore();
const filters = ref({ species: "", status: "available" });
const animals = ref([]);

async function loadAnimals() {
  try {
    const res = await animalAPI.list({
      species: filters.value.species || undefined,
      adoption_status: filters.value.status,
    });
    animals.value = res.data.animals;
    animalsStore.setAnimals(res.data.animals);
  } catch (err) {
    console.error("Failed to load animals:", err);
  }
}

onMounted(() => {
  loadAnimals();
});

watch(
  () => filters.value,
  () => {
    loadAnimals();
  },
  { deep: true }
);
</script>