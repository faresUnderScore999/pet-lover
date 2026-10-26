<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-animal-900 text-white rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
      <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paw-prints.png')]"></div>
      <div class="relative z-10 max-w-3xl">
        <h1 class="text-3xl md:text-5xl font-bold mb-4">Protecting Tunisia's Street Animals</h1>
        <p class="text-lg md:text-xl text-animal-100 mb-6">
          A community-driven platform connecting citizens, rescuers, associations, and veterinarians to create humane solutions for street animals across Tunisia.
        </p>
        <div class="flex flex-wrap gap-3">
          <router-link to="/report" class="bg-white text-animal-900 px-6 py-3 rounded-xl font-bold hover:bg-animal-50 transition-colors">Report an Incident</router-link>
          <router-link to="/map" class="border border-white/30 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">View Safety Map</router-link>
        </div>
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
        <div class="text-3xl font-bold text-animal-600">24/7</div>
        <p class="text-gray-600 mt-1">Community reporting</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
        <div class="text-3xl font-bold text-animal-600">TNR</div>
        <p class="text-gray-600 mt-1">Sterilization coordination</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
        <div class="text-3xl font-bold text-animal-600">TND</div>
        <p class="text-gray-600 mt-1">Micro-donation pool</p>
      </div>
    </section>

    <!-- Featured Animals -->
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span class="text-animal-600">🐶</span> Animals Available for Adoption
      </h2>
      <div v-if="animals.length === 0" class="text-center py-12 text-gray-500">
        No animals available for adoption yet. Be the first to list one!
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimalCard v-for="animal in animals" :key="animal.id" :animal="animal" />
      </div>
    </section>

    <!-- How It Works -->
    <section class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center p-6">
          <div class="w-12 h-12 bg-animal-100 rounded-full flex items-center justify-center text-animal-600 text-2xl mx-auto mb-4">📍</div>
          <h3 class="font-bold text-gray-900 mb-2">Report</h3>
          <p class="text-gray-600 text-sm">Report stray packs, injured animals, or overflowing trash bins with geolocation.</p>
        </div>
        <div class="text-center p-6">
          <div class="w-12 h-12 bg-animal-100 rounded-full flex items-center justify-center text-animal-600 text-2xl mx-auto mb-4">🏥</div>
          <h3 class="font-bold text-gray-900 mb-2">Coordinate</h3>
          <p class="text-gray-600 text-sm">Connect with vets and associations for TNR and medical care.</p>
        </div>
        <div class="text-center p-6">
          <div class="w-12 h-12 bg-animal-100 rounded-full flex items-center justify-center text-animal-600 text-2xl mx-auto mb-4">💚</div>
          <h3 class="font-bold text-gray-900 mb-2">Adopt or Foster</h3>
          <p class="text-gray-600 text-sm">Give a rescued animal a loving home or temporary foster care.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useAnimalsStore } from "@/stores/animals";
import { animalAPI } from "@/api";
import AnimalCard from "@/components/AnimalCard.vue";

const animalsStore = useAnimalsStore();
const animals = computed(() => animalsStore.animals);

onMounted(async () => {
  try {
    const res = await animalAPI.list({ adoption_status: "available", limit: 9 });
    animalsStore.setAnimals(res.data.animals);
  } catch (err) {
    console.error("Failed to load featured animals:", err);
  }
});
</script>