<template>
  <div class="scanner-container">
    <input 
      type="text" 
      ref="scannerInput" 
      v-model="scannedData" 
      @keydown.enter.prevent="handleScan"
      class="scanner-input"
      placeholder="QR kodni skaner qiling..."
    />
    
    <p v-if="message" :class="{'success-message': message.includes('To‘lov tasdiqlandi'), 'error-message': !message.includes('To‘lov tasdiqlandi')}">
  {{ message }}
    </p>


    <div v-if="apiResult" class="result-container">
      <h3 class="order-title">🍽 Buyurtma tafsilotlari</h3>
      
      <div class="order-info">
        <p><strong>🆔 Buyurtma ID:</strong> {{ apiResult.id }}</p>
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
</template>

<script>
export default {
  data() {
    return {
      scannedData: "",
      isScanning: false,
      message: "",
      apiResult: null
    };
  },
  mounted() {
    this.focusInput();
  },
  methods: {
    async handleScan() {
      if (this.isScanning) return;
      if (!this.scannedData.trim() || this.scannedData.length !== 8) {
        alert("QR kod noto‘g‘ri! 8 xonali raqam bo‘lishi kerak.");
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
        
        // 2 soniyadan keyin qutini yopamiz va skan qilishga qaytamiz
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
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
.scanner-input {
  width: 300px;
  padding: 10px;
  font-size: 18px;
  border: 2px solid #007bff;
  border-radius: 5px;
  text-align: center;
  margin-bottom: 10px;
}
.error-message {
  color: red;
}

.success-message {
  color: 28a745;
  font-weight: bold;
}

.result-container {
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
  background: #fff;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
}
.order-title {
  font-size: 20px;
  margin-bottom: 10px;
}
.order-info {
  text-align: left;
  margin-bottom: 10px;
}
.food-table {
  width: 100%;
  border-collapse: collapse;
}
.food-table th, .food-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}
.food-table th {
  background-color: #007bff;
  color: white;
}
.pay-button {
  margin-top: 10px;
  padding: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}
.pay-button:hover {
  background: #218838;
}
</style>
