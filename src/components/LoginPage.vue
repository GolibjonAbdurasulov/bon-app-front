<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="title">Tizimga Kirish</h2>

      <div class="input-group">
        <label for="username" style="color: green; font-weight: bold;">Login</label>
        <input v-model="username" type="text" id="username" placeholder="Foydalanuvchi nomi" />
      </div>

      <div class="input-group">
        <label for="password" style="color: green; font-weight: bold;">Parol</label>
        <div class="password-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            placeholder="Parolni kiriting"
          />
          <span class="toggle-password" @click="togglePasswordVisibility">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </span>
        </div>
      </div>

      <button class="login-btn" @click="login" :disabled="isLoading">
        <span v-if="isLoading">Yuklanmoqda...</span>
        <span v-else>Kirish</span>
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

// State variables
const username = ref("");
const password = ref("");
const showPassword = ref(false); // Parol ko'rsatiladimi yo'qmi
const isLoading = ref(false);
const errorMessage = ref("");

// Password visibility toggle function
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Login logic
const login = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await axios.post("https://api.bonapp.uz/Auth/Login", {
      login: username.value,
      password: password.value,
    });

    if (response.status === 200 && response.data.code === 200) {
      const { token, userRole } = response.data.content;
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("user_role", userRole);
      window.location.href = "/home";
    } else {
      errorMessage.value = "Login yoki parol noto‘g‘ri!";
    }
  } catch (error) {
    errorMessage.value = "Server xatosi! Iltimos, qayta urinib ko‘ring.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 320px;
  text-align: center;
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: #2e7d32;
}

.input-group {
  margin-top: 15px;
  text-align: left;
}

label {
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #2e7d32;
  outline: none;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  color: #2e7d32;
}

.toggle-password:hover {
  color: #1b5e20;
}

.login-btn {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background-color: #225c22;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  color: red;
  font-size: 14px;
}
</style>