<template>
  <div class="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-animal-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4">
          🐾
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p class="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input v-model="credentials.email" type="email" required class="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input v-model="credentials.password" type="password" required class="input-field" placeholder="••••••••" />
        </div>

        <button type="submit" :loading="loading" class="btn-primary w-full">Sign In</button>

        <p class="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <router-link to="/register" class="text-animal-600 font-medium">Create one</router-link>
        </p>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ error }}
      </div>

      <div class="mt-6 pt-6 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-600">Demo accounts:</p>
        <ul class="text-xs text-gray-500 mt-2 space-y-1">
          <li>admin@animal.tn / Admin123!</li>
          <li>vet@animal.tn / Vet123!</li>
          <li>assoc@animal.tn / Assoc123!</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { authAPI } from "@/api";

const router = useRouter();
const auth = useAuthStore();
const credentials = ref({ email: "", password: "" });
const loading = ref(false);
const error = ref(null);

async function handleLogin() {
  loading.value = true;
  error.value = null;
  try {
    const res = await authAPI.login(credentials.value);
    auth.setAuth(res.data.token, res.data.user);
    router.push("/");
  } catch (err) {
    error.value = err.response?.data?.error || "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>