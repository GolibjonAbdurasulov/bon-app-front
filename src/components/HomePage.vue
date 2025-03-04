<template>
  <div class="container">
    <h1>Scanner qiling</h1>

    <!-- Scanner Input (ko‘rinmas) -->
    <input 
      type="text" 
      ref="scannerInput" 
      v-model="scannedData" 
      @keydown.enter="handleScan" 
      class="scanner-input"
    />

    <!-- API natijasi mavjud bo‘lsa -->
    <div v-if="message || apiResult" class="result-box">
      <h2 v-if="apiResult">Buyurtma Ma'lumotlari</h2>
      <p v-if="apiResult"><strong>Stol Raqami:</strong> {{ apiResult.tableNumber }}</p>
      <p v-if="apiResult"><strong>Umumiy Narx:</strong> {{ apiResult.price }} so'm</p>
      <h3 v-if="apiResult">Taomlar:</h3>
      <ul v-if="apiResult">
        <li v-for="(food, index) in apiResult.foods" :key="index">
          {{ food.foodName }} - {{ food.quentity }} ta
        </li>
      </ul>

      <!-- To‘landi Tugmasi -->
      <button v-if="apiResult" @click="markAsPaid" class="pay-button">To‘landi</button>

      <!-- Xatolik yoki Bo‘sh Buyurtma Xabari -->
      <p v-if="message" class="no-orders">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      scannedData: "",
      apiResult: null,
      message: "", 
    };
  },
  methods: {
    async fetchData(url, method = "GET", body = null) {
      console.log(`fetchData -> URL: ${url}, Method: ${method}`);

      const token = localStorage.getItem("jwt_token");
      if (!token) {
        alert("Token topilmadi! Iltimos, tizimga kirish qiling.");
        return null;
      }

      try {
        const options = {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        if (!response.ok) {
          if (response.status === 500) return null;
          throw new Error(`HTTP xato! Status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Xatolik:", error);
        return null;
      }
    },

    async handleScan() {
      console.log("handleScan -> scannedData:", this.scannedData);

      if (!this.scannedData.trim()) {
        alert("QR-kod bo‘sh bo‘lishi mumkin emas!");
        return;
      }

      this.message = ""; 
      this.apiResult = null;

      const result = await this.fetchData(
        `https://api.bonapp.uz/Check/GetCheckByQrCode?number=${this.scannedData.trim()}`
      );

      if (result?.code === 200 && result.content) {
        this.apiResult = result.content;
      } else {
        this.message = "Hali buyurtmalar mavjud emas";
        setTimeout(() => {
          this.message = "";
        }, 2000);
      }

      this.scannedData = "";
      this.focusScanner(); // Har doim inputni aktiv qilish
    },

    async markAsPaid() {
      if (!this.apiResult?.id) {
        alert("ID topilmadi!");
        return;
      }

      const result = await this.fetchData(
        `https://api.bonapp.uz/Check/ChangeCheckStatusToCash?id=${this.apiResult.id}`,
        "PUT",
        {}
      );

      if (result) {
        this.message = "Buyurtma to‘langan holatga o'tkazildi!";
        this.apiResult = null;
        setTimeout(() => {
          this.message = "";
        }, 2000);
      }

      this.focusScanner(); // To‘landi bosilgandan keyin inputni aktiv qilish
    },

    focusScanner() {
      this.$nextTick(() => {
        this.$refs.scannerInput?.focus();
      });
    }
  },

  mounted() {
    this.focusScanner(); // Komponent yuklanganda inputni aktiv qilish
  },
};
</script>

<style scoped>
.container {
  text-align: center;
  padding-top: 50px;
}

/* Scanner Input har doim yashirin */
.scanner-input {
  position: absolute;
  left: -9999px;
}

.result-box {
  margin-top: 20px;
  padding: 20px;
  border: 2px solid #008000;
  border-radius: 10px;
  display: inline-block;
  text-align: left;
  background: #f9f9f9;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.result-box h2 {
  font-size: 24px;
  color: #008000;
}

.result-box ul {
  list-style: none;
  padding: 0;
}

.result-box li {
  margin: 5px 0;
}

.pay-button {
  background: #008000;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 16px;
  transition: background 0.3s ease;
}

.pay-button:hover {
  background: #006400;
}

.no-orders {
  margin-top: 10px;
  color: #ff0000;
  font-weight: bold;
  text-align: center;
}
</style>
