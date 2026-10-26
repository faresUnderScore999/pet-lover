<template>
  <div class="card">
    <div class="relative h-48 overflow-hidden rounded-lg mb-4">
      <img
        v-if="animal.photos && animal.photos.length > 0"
        :src="animal.photos[0]"
        :alt="animal.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
        🐾
      </div>
      <span
        class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase"
        :class="
          animal.adoption_status === 'available'
            ? 'bg-green-100 text-green-700'
            : animal.adoption_status === 'fostered'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        "
      >
        {{ animal.adoption_status }}
      </span>
    </div>

    <div class="space-y-2">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-bold text-gray-900">{{ animal.name || "Unnamed Animal" }}</h3>
        <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">{{ animal.species }}</span>
      </div>
      <p class="text-sm text-gray-600 line-clamp-2">{{ animal.description || "No description available" }}</p>
      <div class="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <span>📍 {{ animal.location || "Location not specified" }}</span>
        <span v-if="animal.age">• {{ animal.age }}</span>
        <span v-if="animal.gender">• {{ animal.gender }}</span>
      </div>
      <div class="flex gap-2 mt-4">
        <button
          v-if="animal.adoption_status === 'available'"
          class="flex-1 btn-primary text-sm py-2"
          @click="$emit('adopt')"
        >
          Adopt / Foster
        </button>
        <button v-else class="flex-1 btn-secondary text-sm py-2">Unavailable</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  animal: {
    type: Object,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["adopt"]);
</script>