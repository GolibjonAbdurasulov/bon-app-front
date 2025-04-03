import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import HomePage from "../components/HomePage.vue";
import OrdersPage from "../components/OrdersPage.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage, name: "Login" },
  { path: "/home", component: HomePage, name: "Home" },
  { path: "/orders", component: OrdersPage, name: "OrdersPage" }, // `name` atributi qo'shildi
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
