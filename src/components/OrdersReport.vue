<template>
    <div class="orders-report-page">
      <!-- Back Button -->
      <button class="back-button" @click="goToHomePage">🔙 Bosh sahifaga qaytish</button>
  
      <!-- Title -->
      <h1 class="page-title" style="color: #007bff;">📊 Buyurtmalar hisoboti</h1>

  
      <!-- Total Price -->
      <div class="total-price">
        <p>Jami narx: <span>{{ formatPrice(totalPrice) }}</span></p>
      </div>
  
      <!-- Pie Chart -->
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from "vue";
  import axios from "axios";
  import { useRouter } from "vue-router";
  import { Chart, registerables } from "chart.js";
  
  // Chart.js ni barcha funksiyalarini ro'yxatdan o'tkazish
  Chart.register(...registerables);
  
  export default {
    setup() {
      const router = useRouter();
      const totalPrice = ref(0);
      const chartData = ref(null);
      const chartCanvas = ref(null);
  
      // Fetch data from API
      const fetchOrdersReport = async () => {
        try {
          const response = await axios.get("https://api.bonapp.uz/Order/GetOrdersReportThisDay", {
            headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
          });
  
          if (response.data.code === 200) {
            const content = response.data.content;
  
            // Set total price
            totalPrice.value = content.totalPrice;
  
            // Prepare chart data
            chartData.value = {
              labels: [
                "Ovqatlar",
                "Salatlar",
                "Ichimliklar",
                "Nonlar",
                "Souslar",
                "Shirinliklar",
              ],
              datasets: [
                {
                  data: [
                    content.countFoodsOrders,
                    content.countSaladsOrders,
                    content.countDrinksOrders,
                    content.countBreadsOrders,
                    content.countSousesOrders,
                    content.countSweetnessOrders,
                  ],
                  backgroundColor: [
                    "#FF6384", // Ovqatlar
                    "#36A2EB", // Salatlar
                    "#FFCE56", // Ichimliklar
                    "#4BC0C0", // Nonlar
                    "#9966FF", // Souslar
                    "#FF9F40", // Shirinliklar
                  ],
                  hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                  ],
                },
              ],
            };
  
            // Render the chart
            renderChart();
          }
        } catch (error) {
          console.error("Error fetching orders report:", error);
        }
      };
  
      // Render the chart
      const renderChart = () => {
        if (chartCanvas.value && chartData.value) {
          new Chart(chartCanvas.value, {
            type: "pie",
            data: chartData.value,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "right",
                  labels: {
                    font: {
                      size: 14,
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => {
                      const label = chartData.value.labels[tooltipItem.dataIndex];
                      const value = chartData.value.datasets[0].data[tooltipItem.dataIndex];
                      return `${label}: ${value}`;
                    },
                  },
                },
                datalabels: {
                  color: "#fff", // Matn rangi (oq)
                  font: {
                    size: 16, // Font hajmi
                    weight: "bold", // Qalin shrift
                  },
                  formatter: (value) => {
                    return value; // Har bir bo'lakdagi qiymatni ko'rsatish
                  },
                },
              },
            },
            plugins: [
              {
                id: "custom_canvas_background_color",
                beforeDraw: (chart) => {
                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.globalCompositeOperation = "destination-over";
                  ctx.fillStyle = "#f9f9f9"; // Orqa fon rangi
                  ctx.fillRect(0, 0, chart.width, chart.height);
                  ctx.restore();
                },
              },
            ],
          });
        }
      };
  
      // Go back to HomePage
      const goToHomePage = () => {
        router.push({ name: "Home" });
      };
  
      // Format price
      const formatPrice = (price) => {
        return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
      };
  
      // Fetch data on component mount
      onMounted(() => {
        fetchOrdersReport();
      });
  
      return {
        totalPrice,
        chartCanvas,
        goToHomePage,
        formatPrice,
      };
    },
  };
  </script>
  
  <style scoped>
  .orders-report-page {
    display: flex;
    flex-direction: column;
    align-items: center;
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
  
  .page-title {
    font-size: 28px;
    font-weight: bold;
    color: #343a40;
    margin-top: 60px;
    text-align: center;
  }
  
  .total-price {
    margin-top: 20px;
    font-size: 24px;
    color: #28a745; /* Yashil rang */
    font-weight: bold;
  }
  .total-price span {
    font-size: 32px;
  }
  
  .chart-container {
    margin-top: 40px;
    width: 100%;
    max-width: 600px;
    height: 400px;
  }
  
  @media (max-width: 768px) {
    .page-title {
      font-size: 24px;
    }
  
    .total-price {
      font-size: 20px;
    }
    .total-price span {
      font-size: 28px;
    }
  
    .chart-container {
      max-width: 400px;
      height: 300px;
    }
  }
  </style>