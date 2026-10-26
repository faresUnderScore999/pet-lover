import { defineStore } from "pinia";
import { ref } from "vue";

export const useSafetyStore = defineStore("safety", () => {
  const flags = ref([]);

  function setFlags(list) {
    flags.value = list;
  }

  return { flags, setFlags };
});