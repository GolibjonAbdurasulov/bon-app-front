

<template>
  <div class="container">
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
    </div>

    <div class="content">
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
        const response = await this.fetchData(url, "PUT");
        if (response?.code === 200) {
          this.message = "To‘lov tasdiqlandi!";
          setTimeout(() => {
            this.apiResult = null;
            this.message = "";
            this.isScanning = false;
          }, 2000);
        } else {
          throw new Error("Serverdan noto‘g‘ri javob keldi");
        }
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
        return null;
      }
    },

    resetScanner() {
      setTimeout(() => {
        this.scannedData = "";
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
/* Umumiy container */
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
  background-color: #f4f7fc;
}

/* QR kod skaner paneli */
.scanner-panel {
  width: 100%;
  text-align: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.scanner-input {
  width: 80%;
  padding: 12px;
  font-size: 18px;
  border: 2px solid #007bff;
  border-radius: 8px;
  text-align: center;
  outline: none;
  transition: 0.3s;
}

.scanner-input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
}

.message {
  margin-top: 10px;
  color: #dc3545;
  font-weight: bold;
}

/* Asosiy content qismi */
.content {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

/* Buyurtmalar paneli */
.orders-panel {
  flex: 1;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
}

.panel-title {
  font-size: 20px;
  font-weight: bold;
  color: #343a40;
  margin-bottom: 15px;
}

.orders-list {
  list-style: none;
  padding: 0;
}

.order-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Buyurtma tafsilotlari */
.result-container {
  flex: 2;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.order-title {
  font-size: 22px;
  font-weight: bold;
  color: #343a40;
  margin-bottom: 15px;
}

.order-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.food-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.food-table th, .food-table td {
  border: 1px solid #dee2e6;
  padding: 8px;
  text-align: left;
}

.food-table th {
  background-color: #007bff;
  color: white;
}

/* To‘lov tugmasi */
.pay-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 15px;
}

.pay-button:hover {
  background: #218838;
}

/* Mobil ekranlar uchun moslashtirish */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }

  .scanner-input {
    width: 100%;
  }

  .pay-button {
    width: 100%;
  }
}
</style>

