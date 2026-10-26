import { defineStore } from "pinia";
import { ref } from "vue";

export const useAnimalsStore = defineStore("animals", () => {
  const animals = ref([]);
  const loading = ref(false);

  function setAnimals(list) {
    animals.value = list;
  }

  return { animals, loading, setAnimals };
});