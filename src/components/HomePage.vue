<template>
    <div class="container" @click="closeSidebar">
      <header class="app-bar">
        <h1 v-if="!isSidebarOpen"></h1> <!-- faqat sidebar yopiq bo'lsa ko'rsatiladi -->
        <button class="menu-btn" @click.stop="toggleSidebar" v-if="!isSidebarOpen">&#9776;</button>
      </header>
      <div class="sidebar" :class="{ open: isSidebarOpen }" @click.stop>
        <ul>
          <li><span class="icon">🔹</span><a href="#">Biz haqimizda</a></li>
          <li><span class="icon">📞</span><a href="#">Bog'lanish</a></li>
        </ul>
        <ul class="logout">
          <li><span class="icon">🚪</span><a href="#">Chiqish</a></li>
        </ul>
      </div>
      <div class="main-content">
        <h2 class="message">BonApp-ga xush kelibsiz!</h2>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isSidebarOpen: false,
      };
    },
    methods: {
      toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
      },
      closeSidebar() {
        if (this.isSidebarOpen) {
          this.isSidebarOpen = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Global reset */
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
  
  /* Container */
  .container {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  
  /* App Bar */
  .app-bar {
    width: 100%;
    height: 60px;
    background: #008000;
    color: white;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 20px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
  }
  
  .menu-btn {
    font-size: 28px;
    background: none;
    border: none;
    cursor: pointer;
    color: white;
    margin-left: 0;
  }
  
  /* Sidebar */
  .sidebar {
    width: 350px;
    background: white;
    color: black;
    height: 100vh;
    position: fixed;
    left: -350px;
    top: 0;
    transition: left 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid #ddd;
    padding-top: 60px;
    z-index: 2;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  /* Sidebar Links */
  .sidebar ul {
    list-style: none;
    padding: 40px 20px 20px;
    margin: 0;
  }
  
  .sidebar ul li {
    margin: 20px 0;
    display: flex;
    align-items: center;
    font-size: 18px;
  }
  
  .sidebar ul li .icon {
    margin-right: 15px;
    color: #0aa90a; /* Yashil rang */
    font-size: 20px;
  }
  
  .sidebar ul li a {
    color: black;
    text-decoration: none;
  }
  
  .logout {
    margin-top: auto;
    padding-bottom: 20px;
  }
  
  .logout li .icon {
    color: #ff0000;
  }
  
  .logout li a {
    color: #ff0000;
    font-weight: bold;
  }
  
  /* Main Content */
  .main-content {
    flex-grow: 1;
    text-align: center;
    padding: 80px 20px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .main-content h2 {
    font-size: 24px;
    color: #333;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .sidebar {
      width: 250px;
    }
  
    .app-bar {
      height: 50px;
    }
  
    .menu-btn {
      font-size: 24px;
    }
  
    .main-content {
      padding-top: 70px;
    }
  }
  
  @media (max-width: 480px) {
    .sidebar {
      width: 200px;
    }
  
    .app-bar {
      height: 45px;
    }
  
    .menu-btn {
      font-size: 22px;
    }
  
    .main-content {
      padding-top: 60px;
      font-size: 18px;
    }
  
    /* Hide menu button in small screens */
    .menu-btn {
      display: block;
    }
  }
  
  </style>
  