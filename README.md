# 🌞 Solar Panel Monitoring System - Backend

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

> **Backend API for a Smart Solar Panel Tracking System — Graduation Project**

---

## 📋 Overview

This is the backend service for a **comprehensive solar panel monitoring system** that collects, analyzes, and visualizes real-time performance data from solar panels. The system features multi-role access, automated anomaly detection, and in-depth analytics.

**Frontend Repository:** [solar_front](https://github.com/mohamedhany1231/solar_front)

---

## ✨ Key Features

### 🔐 Authentication & Security
- Multi-role **JWT authentication** (Admin, Manager, User)
- **Panel-specific JWT tokens** for embedded systems
- Secure password hashing with **bcrypt**
- **Rate limiting**, **CORS protection**, and **security headers**
- **XSS** and **NoSQL injection** prevention

### 📊 Data Management
- Real-time data collection from panels (temperature, power, humidity, etc.)
- Automated **anomaly warning system**
- **Color metrics** analysis for condition monitoring
- Efficient MongoDB storage using **Mongoose**

### 📈 Analytics & Insights
- Performance analytics and energy calculations  
- Weekly / Monthly trend visualization  
- Peak performance time detection  
- Best-performing panel tracking  

---

## 🏗️ System Architecture

```bash
solar-back/
├── controllers/
│   ├── authController.js
│   ├── panelController.js
│   ├── readingController.js
│   └── userController.js
├── models/
│   ├── User.js
│   ├── Panel.js
│   ├── Reading.js
│   └── Warning.js
├── routes/
│   ├── userRoutes.js
│   ├── panelRoutes.js
│   └── readingRoutes.js
├── utils/
│   ├── apiFeatures.js
│   ├── appError.js
│   ├── catchAsync.js
│   └── email.js
├── app.js
├── server.js
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

**1. Clone the Repository**
```bash
git clone https://github.com/mohamedhany1231/solar-back.git
cd solar-back
```

**2. Install Dependencies**
```bash
npm install
```

**3. Environment Configuration**  
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/solar-monitoring
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=90d
JWT_PANEL_SECRET=your_panel_jwt_secret
JWT_PANEL_EXPIRES_IN=365d
```

**4. Run the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 🔌 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/v1/users/login` | User authentication |
| POST | `/api/v1/panels/initialize-panel` | Panel registration & token generation |

### 📟 Panel Management
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/v1/panels/myPanels` | Get user’s assigned panels |
| GET | `/api/v1/panels/best-panel` | Get best-performing panel |

### 📊 Data & Analytics
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/v1/readings/create-reading` | Store sensor readings |
| GET | `/api/v1/readings/weekly` | Weekly performance data |
| GET | `/api/v1/readings/monthly` | Monthly trend data |

### 👥 User Management
| Method | Endpoint | Description |
|--------|-----------|-------------|
| PATCH | `/api/v1/users/updateMyPassword` | Update password |
| PATCH | `/api/v1/users/update-settings` | Update user preferences |

---

## 🛠️ Development Scripts
| Command | Description |
|----------|-------------|
| `npm run dev` | Start in development mode (hot reload) |
| `npm start` | Start in production mode |

---

## 🧩 Data Models

### 👤 User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: ['user', 'manager', 'admin'],
  panels: [Panels user has access to]
}
```

### ☀️ Panel Model
```javascript
{
  name: String,
  location: String,
  capacity: Number,
  installationDate: Date,
  assignedUsers: [User references],
  status: ['active', 'inactive', 'maintenance']
}
```

### 📈 Reading Model
```javascript
{
  panel: Panel reference,
  timestamp: Date,
  temperature: Number,
  current: Number,
  voltage: Number,
  power: Number,
  intensity: Number,
  humidity: Number,
  pressure: Number,
  colorMetrics: Object
}
```

---

## 👥 Team Roles

- **Backend & Web Development:** Mohamed Hany ([GitHub](https://github.com/mohamedhany1231))  
- **Embedded Systems:** Team Members  
- **AI Components:** Team Members  

---

## 🔒 Security Features
- JWT-based role authentication  
- Password hashing with **bcrypt**  
- Rate limiting to prevent abuse  
- CORS configuration for frontend-backend communication  
- NoSQL injection & XSS protection  

---

## 📊 Performance Monitoring

The system continuously tracks:

- **Electrical:** Current, Voltage, Power output  
- **Environmental:** Temperature, Humidity, Pressure  
- **Light:** Intensity measurements  
- **Panel Health:** Color metrics for degradation analysis  

---

<div align="center">

**Smart Solar Monitoring System — Graduation Project 2024**

</div>
```
---

✅ You can now **copy everything above in one go**, paste it into your README file, and then **remove the `` signs** — all formatting will render perfectly.
