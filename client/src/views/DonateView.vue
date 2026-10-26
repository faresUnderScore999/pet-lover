<template>
  <div class="max-w-4xl mx-auto py-4">
    <div class="bg-animal-600 rounded-2xl p-8 text-white mb-8">
      <h2 class="text-3xl font-bold mb-2">Support Medical Care</h2>
      <p class="text-animal-100 mb-6">
        Help cover veterinary costs for street animals. Every dinar goes directly to sterilization, vaccination, and treatment.
      </p>
      <div class="flex items-center gap-4">
        <span class="text-4xl font-bold">{{ totalDonated }} TND</span>
        <span class="text-animal-100/80">raised for animal medical care</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Donation Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-6">Make a Donation</h3>
        <form @submit.prevent="handleDonate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount (TND)</label>
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400">TND</span>
              <input v-model="donation.amount" type="number" required class="input-field pl-10" min="1" step="0.1" placeholder="10" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
            <textarea v-model="donation.message" rows="3" class="input-field" placeholder="A message of support..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Donate to</label>
            <select v-model="donation.target_type" class="input-field" @change="updateTargetOptions">
              <option value="tnr_case">TNR Case</option>
              <option value="animal">Specific Animal</option>
            </select>
          </div>
          <div v-if="targetOptions.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select</label>
            <select v-model="donation.target_id" class="input-field">
              <option v-for="opt in targetOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
            </select>
          </div>
          <button type="submit" :loading="loading" class="btn-primary w-full py-3">
            Donate {{ donation.amount }} TND
          </button>
        </form>
      </div>

      <!-- Recent Donations -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Recent Donations</h3>
        <div v-if="recentDonations.length === 0" class="text-center py-8 text-gray-500 text-sm">
          No donations yet. Be the first to support!
        </div>
        <div v-else class="space-y-4">
          <div v-for="d in recentDonations" :key="d.id" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div class="text-sm font-medium text-gray-900">{{ d.donor_name || "Anonymous" }}</div>
              <div class="text-xs text-gray-500">{{ d.message || "General support" }}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-animal-600">{{ d.amount }} TND</div>
              <div class="text-xs text-gray-400">{{ formatDate(d.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { donationAPI, tnrAPI, animalAPI } from "@/api";

const auth = useAuthStore();
const donation = ref({
  amount: "",
  message: "",
  target_type: "tnr_case",
  target_id: null,
});
const targetOptions = ref([]);
const recentDonations = ref([]);
const totalDonated = ref(0);
const loading = ref(false);

onMounted(async () => {
  await loadTargetOptions();
  await loadDonations();
});

async function loadTargetOptions() {
  try {
    if (donation.value.target_type === "tnr_case") {
      const res = await tnrAPI.list({});
      targetOptions.value = res.data.tnr_cases.map((c) => ({
        id: c.id,
        label: `TNR Case - ${c.animal_name || "Unnamed"}`,
      }));
    } else {
      const res = await animalAPI.list({ adoption_status: "available" });
      targetOptions.value = res.data.animals.map((a) => ({
        id: a.id,
        label: `${a.name || "Unnamed"} (${a.species})`,
      }));
    }
  } catch (err) {
    console.error("Failed to load targets:", err);
  }
}

async function loadDonations() {
  try {
    const res = await donationAPI.list({});
    recentDonations.value = res.data.donations;
    totalDonated.value = res.data.donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  } catch (err) {
    console.error("Failed to load donations:", err);
  }
}

function updateTargetOptions() {
  loadTargetOptions();
}

async function handleDonate() {
  if (!auth.user) {
    alert("Please log in to make a donation");
    return;
  }
  loading.value = true;
  try {
    const payload = {
      amount: parseFloat(donation.value.amount),
      currency: "TND",
      message: donation.value.message,
    };
    if (donation.value.target_type === "tnr_case") {
      payload.tnr_case_id = donation.value.target_id;
    } else {
      payload.animal_id = donation.value.target_id;
    }
    await donationAPI.create(payload);
    donation.value = { amount: "", message: "", target_type: "tnr_case", target_id: null };
    await loadDonations();
  } catch (err) {
    alert(err.response?.data?.error || "Donation failed");
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ar-TN");
}
</script>