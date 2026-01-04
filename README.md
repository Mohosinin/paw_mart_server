# 🐾 PawMart - Backend API

<div align="center">

**RESTful API for PawMart Pet Adoption Platform**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

</div>

---

## 🌐 Frontend Website

**� [https://paw-mart-client-beta.vercel.app](https://paw-mart-client-beta.vercel.app)**

---

## 📖 About

This is the backend API server for PawMart - a pet adoption and care marketplace. It provides RESTful endpoints for managing users, listings, orders, and admin functions.

---

## ✨ Features

- 🔐 **User Management** - Registration, authentication, role-based access
- 📦 **Listings API** - CRUD operations for pet/product listings
- 🛒 **Orders API** - Order creation, tracking, and status updates
- 👨‍💼 **Admin Panel** - User management, platform statistics
- 🔒 **Security** - CORS configured, input validation

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Firebase

---

## 📡 API Endpoints

| Resource | Endpoints |
|----------|-----------|
| **Listings** | GET, POST, PUT, DELETE `/listings` |
| **Orders** | GET, POST, PATCH, DELETE `/orders` |
| **Users** | GET, POST, PATCH, DELETE `/users` |
| **Admin** | GET `/admin/stats` |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run server
npm start
```

---

## � Related Repository

- **Frontend**: [paw_mart_client](https://github.com/Mohosinin/paw_mart_client)

---

<div align="center">

**Built with ❤️ using Node.js & MongoDB**

</div>
