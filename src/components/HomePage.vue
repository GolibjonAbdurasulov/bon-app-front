<template>
  <div class="container">
    <!-- Qabul qilingan buyurtmalar -->
    <div v-if="!isScanning" class="orders-panel">
      <h3 class="panel-title">📋 Qabul qilingan buyurtmalar</h3>
      <ul v-if="receivedOrders.length" class="orders-list">
        <li v-for="order in receivedOrders" :key="order.id" class="order-item">
          <p><strong>🔐 ID:</strong> {{ order.id }}</p>
          <p><strong>🪑 Stol:</strong> {{ order.tableNumber }}</p>
          <ul>
            <li v-for="food in order.orderedFoodsDto" :key="food.foodName">
              {{ food.foodName }} - {{ food.foodCount }} ta
            </li>
          </ul>
        </li>
      </ul>
      <p v-else>Hozircha buyurtmalar yo‘q.</p>
    </div>

    <!-- QR kod skaner paneli -->
    <div class="scanner-panel">
      <input 
        type="text" 
        ref="scannerInput" 
        v-model="scannedData" 
        @keydown.enter.prevent="handleScan"
        class="scanner-input"
        placeholder="📷 QR kodni skaner qiling..."
      />
      <p v-if="message" class="message">{{ message }}</p>
      
      <!-- Skanner natijalari -->
      <div v-if="apiResult" class="result-container">
        <h3 class="order-title">🍽 Buyurtma tafsilotlari</h3>
        <div class="order-info">
          <p><strong>🔐 Buyurtma ID:</strong> {{ apiResult.id }}</p>
          <p><strong>🪑 Stol raqami:</strong> {{ apiResult.tableNumber }}</p>
          <p><strong>💰 Umumiy narx:</strong> {{ formatPrice(apiResult.price) }}</p>
        </div>
        <table class="food-table">
          <thead>
            <tr>
              <th>🥘 Ovqat</th>
              <th>🔢 Miqdor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="food in apiResult.foods" :key="food.foodName">
              <td>{{ food.foodName }}</td>
              <td>{{ food.quentity }} ta</td>
            </tr>
          </tbody>
        </table>
        <button @click="markAsPaid" class="pay-button">✅ To‘landi</button>
      </div>
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
      receivedOrders: []
    };
  },
  mounted() {
    this.focusInput();
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        const url = "https://api.bonapp.uz/Order/GetAllReceivedOrdersToPayOffice";
        const result = await this.fetchData(url);
        if (result?.code === 200 && result.content) {
          this.receivedOrders = result.content;
        }
      } catch (error) {
        console.error("Buyurtmalarni yuklashda xatolik:", error);
      }
    },

    async handleScan() {
      if (this.isScanning) return;
      if (!this.scannedData.trim()) {
        alert("QR kod noto‘g‘ri!");
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
        }
      } catch (error) {
        this.message = "Server bilan aloqa yo‘q!";
      }
      this.resetScanner();
    },

    async markAsPaid() {
      try {
        const url = `https://api.bonapp.uz/Check/ChangeCheckStatusToCash?id=${this.apiResult.id}`;
        await this.fetchData(url, "PUT");
        this.message = "To‘lov tasdiqlandi!";
        setTimeout(() => {
          this.message = "";
          this.apiResult = null;
          this.resetScanner();
        }, 2000);
      } catch (error) {
        this.message = "To‘lov tasdiqlanmadi!";
      }
    },

    async fetchData(url, method = "GET") {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error("Token topilmadi! Avval login qiling");
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Server javobi noto‘g‘ri");
        return response.json();
      } catch (error) {
        console.error("fetchData xatosi:", error);
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
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  width: 100%;
}
.orders-panel {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  border-right: 2px solid #ddd;
}
.panel-title {
  font-size: 20px;
  margin-bottom: 10px;
}
.orders-list {
  list-style: none;
  padding: 0;
}
.order-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
.scanner-panel {
  flex: 1;
  padding: 20px;
  text-align: center;
}
.scanner-input {
  width: 100%;
  padding: 10px;
  font-size: 18px;
  border: 2px solid #007bff;
  border-radius: 5px;
  text-align: center;
}
</style>
