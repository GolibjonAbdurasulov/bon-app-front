<template>
  <div class="container">
    <!-- QR Code Scanner Panel -->
    <div class="scanner-panel">
      <input
        type="text"
        ref="scannerInput"
        v-model="scannedData"
        @keydown.enter.prevent="handleScan"
        class="scanner-input"
        placeholder="🔍 QR kodni skaner qiling..."
      />
      <p v-if="message" :class="['message', { 'success-message': isSuccessMessage }]">{{ message }}</p>
    </div>

    <!-- Scanned Order Details -->
    <div v-if="apiResult" class="result-container">
      <h3 class="order-title">🛒 Buyurtma tafsilotlari</h3>
      <div class="order-info">
        <p><strong>📋 Buyurtma ID:</strong> {{ apiResult.id }}</p>
        <p><strong>🪑 Stol raqami:</strong> {{ apiResult.tableNumber || "Noma'lum" }}</p>
        <p><strong>💰 Umumiy narx:</strong> {{ formatPrice(apiResult.price) }}</p>
      </div>
      <table class="food-table">
        <thead>
          <tr>
            <th>🍔 Ovqat</th>
            <th>🔢 Miqdor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in apiResult.items" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }} ta</td>
          </tr>
        </tbody>
      </table>
      <button @click="markAsPaid" class="pay-button">✅ To‘landi</button>
    </div>

    <!-- Orders Button (Fixed Position) -->
    <div class="orders-button-container">
      <button @click="goToOrdersPage" class="orders-button">📖 Buyurtmalar bo'limiga o'tish</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scannedData: "",
      isScanning: false,
      message: "",
      apiResult: null,
      isSuccessMessage: false,
    };
  },
  mounted() {
    this.focusInput();
  },
  methods: {
    async handleScan() {
      if (this.isScanning) return;
      if (!this.scannedData.trim()) {
        this.message = "QR kod noto‘g‘ri!";
        this.isSuccessMessage = false;
        this.resetScanner();
        return;
      }
      this.isScanning = true;
      this.message = "";
      this.apiResult = null;
      try {
        const url = `https://api.bonapp.uz/Check/GetCheckByQrCode?number=${this.scannedData.trim()}`;
        const result = await this.fetchData(url);
        if (result?.code === 200 && result.content) {
          this.apiResult = result.content;
        } else {
          this.message = "Hali buyurtmalar mavjud emas";
          this.isSuccessMessage = false;
        }
      } catch (error) {
        this.message = "Server bilan aloqa yo‘q!";
        this.isSuccessMessage = false;
      }
      this.resetScanner();
    },
    async markAsPaid() {
      try {
        const url = `https://api.bonapp.uz/Check/ChangeCheckStatusToCash?id=${this.apiResult.id}`;
        const response = await this.fetchData(url, "PUT");
        if (response?.code === 200) {
          this.message = "To‘lov tasdiqlandi!";
          this.isSuccessMessage = true;
          setTimeout(() => {
            this.apiResult = null;
            this.message = "";
            this.isSuccessMessage = false;
            this.isScanning = false;
          }, 2000);
        } else {
          throw new Error("Serverdan noto‘g‘ri javob keldi");
        }
      } catch (error) {
        this.message = "To‘lov tasdiqlanmadi!";
        this.isSuccessMessage = false;
      }
    },
    async fetchData(url, method = "GET") {
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) throw new Error("Token topilmadi! Avval login qiling");
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Server javobi noto‘g‘ri");
        return response.json();
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    resetScanner() {
      setTimeout(() => {
        this.scannedData = "";
        this.isScanning = false;
        this.focusInput();
      }, 500);
    },
    focusInput() {
      this.$nextTick(() => {
        this.$refs.scannerInput?.focus();
      });
    },
    formatPrice(price) {
      return new Intl.NumberFormat("uz-UZ").format(price) + " so‘m";
    },
    // Orders Page ga o'tish funksiyasi
    goToOrdersPage() {
      this.$router.push({ name: "OrdersPage" }); // OrdersPage.vue ga yo'naltirish
    },
  },
};
</script>

<style scoped>
/* General Container */
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1600px;
  margin: auto;
  padding: 40px;
  font-family: Arial, sans-serif;
  background-color: #f4f7fc;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

/* QR Code Scanner Panel */
.scanner-panel {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}
.scanner-input {
  width: 100%;
  max-width: 700px;
  padding: 16px;
  font-size: 20px;
  border: 3px solid #007bff;
  border-radius: 10px;
  text-align: center;
  outline: none;
  transition: 0.3s;
}
.scanner-input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

/* Message Styles */
.message {
  margin-top: 15px;
  color: #dc3545; /* Qizil rang (standart xato) */
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
.success-message {
  color: #28a745; /* Yashil rang (muvaffaqiyatli xabar) */
}

/* Scanned Order Details */
.result-container {
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 30px;
}
.order-title {
  font-size: 26px;
  font-weight: bold;
  color: #343a40;
  margin-bottom: 20px;
}
.order-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.food-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.food-table th,
.food-table td {
  border: 2px solid #dee2e6;
  padding: 12px;
  text-align: left;
  font-size: 16px;
}
.food-table th {
  background-color: #007bff;
  color: white;
}

/* Payment Button */
.pay-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 20px;
}
.pay-button:hover {
  background: #218838;
}

/* Orders Button (Fixed Position) */
.orders-button-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000; /* Har doim eng ustida bo'lishi uchun */
}
.orders-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.orders-button:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .scanner-input {
    width: 100%;
  }
}
</style>