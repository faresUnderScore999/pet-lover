import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/", name: "Home", component: () => import("@/views/Home.vue") },
  { path: "/map", name: "Map", component: () => import("@/views/MapView.vue") },
  { path: "/report", name: "Report", component: () => import("@/views/ReportView.vue"), meta: { requiresAuth: true } },
  { path: "/tnr", name: "TNR", component: () => import("@/views/TNRView.vue") },
  { path: "/donate", name: "Donate", component: () => import("@/views/DonateView.vue") },
  { path: "/adoption", name: "Adoption", component: () => import("@/views/AdoptionView.vue") },
  { path: "/accountability", name: "Accountability", component: () => import("@/views/AccountabilityView.vue") },
  { path: "/profile", name: "Profile", component: () => import("@/views/ProfileView.vue"), meta: { requiresAuth: true } },
  { path: "/login", name: "Login", component: () => import("@/views/LoginView.vue"), meta: { guest: true } },
  { path: "/register", name: "Register", component: () => import("@/views/RegisterView.vue"), meta: { guest: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: "Login" };
  }
  if (to.meta.guest && isAuthenticated) {
    return { name: "Home" };
  }
  return true;
});

export default router;