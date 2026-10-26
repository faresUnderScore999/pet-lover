<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-animal-600 rounded-lg flex items-center justify-center text-white font-bold">
              🐾
            </div>
            <span class="font-bold text-xl text-animal-900">StreetAnimals.TN</span>
          </div>

          <div class="hidden md:flex items-center gap-4">
            <router-link to="/" class="px-4 py-2 text-gray-700 hover:text-animal-600 font-medium">Home</router-link>
            <router-link to="/map" class="px-4 py-2 text-gray-700 hover:text-animal-600 font-medium">Safety Map</router-link>
            <router-link to="/report" class="px-4 py-2 text-gray-700 hover:text-animal-600 font-medium">Report</router-link>
            <router-link to="/adoption" class="px-4 py-2 text-gray-700 hover:text-animal-600 font-medium">Adoption</router-link>
            <router-link to="/tnr" class="px-4 py-2 text-gray-700 hover:text-animal-600 font-medium">TNR Hub</router-link>
            <router-link to="/accountability" class="px-4 py-2 text-gray-700 hover:text-animal-600 font-medium">Community</router-link>
          </div>

          <div class="flex items-center gap-3">
            <router-link v-if="!auth.user" to="/login" class="btn-secondary text-sm">Login</router-link>
            <router-link v-if="!auth.user" to="/register" class="btn-primary text-sm">Join</router-link>
            <button v-else @click="logout" class="btn-secondary text-sm">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="w-full flex-1 flex flex-col min-h-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-white border-t border-gray-200 mt-auto py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        <p>StreetAnimals.TN — Community-driven platform for street animal welfare in Tunisia</p>
        <p class="mt-2">&copy; 2026 StreetAnimals.TN. Built with ❤️ for animals and communities.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.clearAuth();
  router.push("/login");
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
