import { defineStore } from "pinia";
import { ref } from "vue";

export const useIncidentsStore = defineStore("incidents", () => {
  const incidents = ref([]);
  const loading = ref(false);

  function setIncidents(list) {
    incidents.value = list;
  }

  function addIncident(incident) {
    incidents.value.unshift(incident);
  }

  return { incidents, loading, setIncidents, addIncident };
});