import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import HomePage from "../components/HomePage.vue";

const routes = [
  { path: "/", redirect: "/login" }, // Bosh sahifa `/login` ga yo‘naltiriladi
  { path: "/login", component: LoginPage },
  { path: "/home", component: HomePage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
