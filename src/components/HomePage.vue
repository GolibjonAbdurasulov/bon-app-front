<template>
  <div class="container">
    <h1>Scanner qiling</h1>

    <!-- Scanner Input -->
    <input
      type="text"
      ref="scannerInput"
      v-model="scannedData"
      @keydown.enter="handleScan"
      class="scanner-input"
    />

    <!-- API natijasi -->
    <div v-if="apiResult" class="result">
      <h2>Buyurtma Ma'lumotlari:</h2>
      <p><strong>Stol Raqami:</strong> {{ apiResult.tableNumber }}</p>
      <p><strong>Umumiy Narx:</strong> {{ apiResult.price }} so'm</p>
      <h3>Taomlar:</h3>
      <ul>
        <li v-for="(food, index) in apiResult.foods" :key="index">
          {{ food.foodName }} - {{ food.quentity }} ta
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      scannedData: "", // Scanner ma'lumotlari
      apiResult: null, // API natijasi
    };
  },
  methods: {
    async handleScan() {
      const qrCode = this.scannedData.trim();
      if (!qrCode) {
        alert("QR-kod bo'sh bo'lishi mumkin emas!");
        return;
      }

      const token = localStorage.getItem("jwt_token");
      if (!token) {
        alert("Token topilmadi! Iltimos, tizimga kiring.");
        window.location.href = "/login"; // Login sahifasiga yo'naltirish
        return;
      }

      try {
        const response = await fetch(
          `https://api.bonapp.uz/Check/GetCheckByQrCode?number=${qrCode}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Xatolik! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.code === 200 && data.content) {
          this.apiResult = data.content;
        } else {
          alert("Xatolik: " + (data.error || "Noma'lum xato"));
        }
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        alert("API bilan bog‘lanishda xatolik: " + error.message);
      } finally {
        this.scannedData = "";
        this.$nextTick(() => this.$refs.scannerInput.focus());
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.scannerInput) {
        this.$refs.scannerInput.focus();
      }
    });
  },
};
</script>

<style scoped>
/* Global Reset */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
}

.container {
  text-align: center;
  width: 100%;
  padding-top: 200px;
}

h1 {
  font-size: 48px;
  color: #008000;
  margin: 0;
}

/* Scanner Input */
.scanner-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Natija */
.result {
  margin-top: 20px;
  font-size: 20px;
  color: #333;
}

.result h2 {
  font-size: 24px;
  color: #008000;
}

.result ul {
  list-style: none;
  padding: 0;
}

.result li {
  margin: 5px 0;
}
</style>
