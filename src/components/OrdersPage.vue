<template>
  <div class="orders-page">
    <!-- Back Button -->
    <button class="back-button" @click="goToHomePage">🔙 Bosh sahifaga qaytish</button>

    <!-- Left Section: Received Orders -->
    <div class="received-orders">
      <h2>📥 Qabul qilingan buyurtmalar</h2>
      <table class="order-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Stol raqami</th>
            <th>Ovqatlar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in receivedOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.tableNumber || "Noma'lum" }}</td>
            <td>
              <ul>
                <li v-for="(food, index) in order.foods" :key="index">{{ food.name }} ({{ food.quantity }} ta)</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Right Section: Delivered Orders -->
    <div class="delivered-orders">
      <h2>✅ Yetkazib berilgan buyurtmalar</h2>
      <table class="order-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Stol raqami</th>
            <th>Ovqatlar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in deliveredOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.tableNumber || "Noma'lum" }}</td>
            <td>
              <ul>
                <li v-for="(food, index) in order.foods" :key="index">{{ food.name }} ({{ food.quantity }} ta)</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import * as signalR from "@microsoft/signalr";

export default {
  setup() {
    const router = useRouter();
    const receivedOrders = ref([]);
    const deliveredOrders = ref([]);

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        // Fetch received orders for today
        const receivedResponse = await axios.get("https://api.bonapp.uz/Order/GetAllReceivedOrdersThisDay", {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
        });

        if (receivedResponse.data.code === 200) {
          receivedOrders.value = receivedResponse.data.content.map((order) => ({
            id: order.id,
            tableNumber: order.tableNumber,
            foods: order.orderedFoodsDto.map((food) => ({
              name: food.foodName,
              quantity: food.foodCount,
            })),
          }));
        }

        // Fetch delivered orders for today
        const deliveredResponse = await axios.get("https://api.bonapp.uz/Order/GetAllDeliveredOrdersThisDay", {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
        });

        if (deliveredResponse.data.code === 200) {
          deliveredOrders.value = deliveredResponse.data.content.map((order) => ({
            id: order.id,
            tableNumber: order.tableNumber,
            foods: order.orderedFoodsDto.map((food) => ({
              name: food.foodName,
              quantity: food.foodCount,
            })),
          }));
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    // Fetch food details by IDs
    const fetchFoodDetails = async (foodIds) => {
      try {
        const foodDetails = await Promise.all(
          foodIds.map(async (foodId) => {
            const response = await axios.get(`https://api.bonapp.uz/OrderedFood/GetByIdToChefView?id=${foodId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
            });
            return {
              name: response.data.content.foodName,
              quantity: response.data.content.quantity,
            };
          })
        );
        return foodDetails;
      } catch (error) {
        console.error("Error fetching food details:", error);
        return foodIds.map(() => ({ name: "Noma'lum", quantity: 1 })); // Default qiymat
      }
    };

    // Go back to HomePage
    const goToHomePage = () => {
      router.push({ name: "Home" });
    };

    // SignalR Connection Setup
    const setupSignalRConnection = () => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://api.bonapp.uz/orderHub", {
          accessTokenFactory: () => localStorage.getItem("jwt_token"),
        })
        .withAutomaticReconnect()
        .build();

      // Start the connection
      connection.start().catch((err) => console.error("SignalR connection error:", err));

      // Listen for "ReceiveOrderUpdate" event (for new received orders)
      connection.on("ReceiveOrderUpdate", async (orderUpdate) => {
  console.log("SignalR xabari keldi:", orderUpdate);

  // Faqat "Received" tipidagi buyurtmalarni qabul qilamiz
  if (orderUpdate.type === "Received") {
    const orderedFoodsIds = Array.isArray(orderUpdate.orderedFoodsIds) ? orderUpdate.orderedFoodsIds : [];
    const foods = await fetchFoodDetails(orderedFoodsIds);

    const newOrder = {
      id: orderUpdate.id,            // Kichik harf bilan "id"
      tableNumber: orderUpdate.tableNumber,  // Kichik harf bilan "tableNumber"
      foods: foods,
    };
    receivedOrders.value = [...receivedOrders.value, newOrder];
  } else {
    console.log("Qabul qilinmagan xabar turi:", orderUpdate.type);
  }
});




// Listen for "SignalRDeliveredOrders" event (for delivered orders)
connection.on("SignalRDeliveredOrders", (orderUpdate) => {
  console.log("Order delivered:", orderUpdate);

  // orderUpdate.id orqali qidiramiz, chunki logda property 'id' deb ko'rsatilgan
  const deliveredOrderIndex = receivedOrders.value.findIndex((order) => order.id === orderUpdate.id);
  if (deliveredOrderIndex !== -1) {
    const [deliveredOrder] = receivedOrders.value.splice(deliveredOrderIndex, 1);
    deliveredOrders.value = [...deliveredOrders.value, deliveredOrder];
  }
});

    };

    onMounted(() => {
      fetchInitialData();
      setupSignalRConnection();
    });

    return {
      receivedOrders,
      deliveredOrders,
      goToHomePage,
    };
  },
};
</script>

<style scoped>
.orders-page {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}
.back-button:hover {
  background: #0056b3;
}

.received-orders,
.delivered-orders {
  width: 48%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.order-table th,
.order-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.order-table th {
  background-color: #007bff;
  color: white;
}

ul {
  list-style-type: none;
  padding: 0;
}

ul li {
  margin: 5px 0;
}
</style>  