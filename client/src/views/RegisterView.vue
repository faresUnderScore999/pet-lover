<template>
  <div class="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-animal-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4">
          🐾
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Create Account</h2>
        <p class="text-gray-600 mt-2">Join the community to protect street animals</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input v-model="form.full_name" type="text" required class="input-field" placeholder="John Doe" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input v-model="form.email" type="email" required class="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input v-model="form.phone" type="tel" class="input-field" placeholder="+216 XX XXX XXX" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input v-model="form.city" type="text" class="input-field" placeholder="Tunis, Sfax, Sousse..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select v-model="form.role" class="input-field">
            <option value="citizen">Citizen</option>
            <option value="rescuer">Rescuer / Volunteer</option>
            <option value="vet">Veterinarian</option>
            <option value="association">Animal Welfare Association</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input v-model="form.password" type="password" required class="input-field" placeholder="••••••••" />
        </div>

        <button type="submit" :loading="loading" class="btn-primary w-full">Create Account</button>

        <p class="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <router-link to="/login" class="text-animal-600 font-medium">Sign in</router-link>
        </p>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ error }}
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
const form = ref({
  full_name: "",
  email: "",
  phone: "",
  city: "",
  role: "citizen",
  password: "",
});
const loading = ref(false);
const error = ref(null);

async function handleRegister() {
  loading.value = true;
  error.value = null;
  try {
    const res = await authAPI.register(form.value);
    auth.setAuth(res.data.token, res.data.user);
    router.push("/");
  } catch (err) {
    error.value = err.response?.data?.error || "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>