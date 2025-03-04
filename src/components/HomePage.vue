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

    <!-- Natija Box -->
    <div v-if="apiResult" class="result-box">
      <h2>Buyurtma Ma'lumotlari</h2>
      <p><strong>Stol Raqami:</strong> {{ apiResult.tableNumber }}</p>
      <p><strong>Umumiy Narx:</strong> {{ apiResult.price }} so'm</p>
      <h3>Taomlar:</h3>
      <ul>
        <li v-for="(food, index) in apiResult.foods" :key="index">
          {{ food.foodName }} - {{ food.quentity }} ta
        </li>
      </ul>
      
      <!-- To'landi Tugmasi -->
      <button @click="markAsPaid" class="pay-button">To'landi</button>
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
    };
  },
  methods: {
    async fetchData(url, method = "GET") {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        alert("Token topilmadi! Iltimos, tizimga kirish qiling.");
        return null;
      }
      
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error(`HTTP xato! Status: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        alert("Xatolik yuz berdi: " + error.message);
        return null;
      }
    },

    async handleScan() {
      if (!this.scannedData.trim()) {
        alert("QR-kod bo'sh bo'lishi mumkin emas!");
        return;
      }
      
      const result = await this.fetchData(`https://api.bonapp.uz/Check/GetCheckByQrCode?number=${this.scannedData.trim()}`);
      
      if (result && result.code === 200) {
        this.apiResult = result.content;
      } else {
        alert("API xatosi: " + (result?.error || "Noma'lum xato"));
      }
      
      this.scannedData = "";
      this.$refs.scannerInput.focus();
    },

    async markAsPaid() {
      if (!this.apiResult?.id) {
        alert("ID topilmadi!");
        return;
      }
      
      const result = await this.fetchData(`https://api.bonapp.uz/Check/ChangeCheckStatusToCash?id=${this.apiResult.id}`, "PUT");
      
      if (result) {
        alert("Buyurtma to'langan holatga o'tkazildi!");
        this.apiResult = null;
      }
    }
  },
  mounted() {
    this.$refs.scannerInput.focus();
  },
};
</script>

<style scoped>
.container {
  text-align: center;
  padding-top: 50px;
}

.scanner-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
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
</style>
