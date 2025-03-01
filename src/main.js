import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // ✅ Router import qilindi

const app = createApp(App);
app.use(router); // ✅ Router Vue ilovasiga qo‘shildi
app.mount("#app");
