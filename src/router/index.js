import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import HomePage from "../components/HomePage.vue";
import OrdersPage from "../components/OrdersPage.vue";
import OrdersReport from "../components/OrdersReport.vue"; // OrdersReport.vue ni import qilish

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage, name: "Login" },
  { path: "/home", component: HomePage, name: "Home" },
  { path: "/orders", component: OrdersPage, name: "OrdersPage" },
  { path: "/orders_report",component: OrdersReport,name: "OrdersReportPage"},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;