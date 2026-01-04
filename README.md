# 🐾 PawMart Backend API

<div align="center">

**RESTful API for PawMart Pet Adoption & Care Platform**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

</div>

---

## 🌐 Frontend Website

**🔗 Live Site: [https://paw-mart-client-ugad.vercel.app](https://paw-mart-client-ugad.vercel.app)**

---

## 📖 About

This is the backend API server for PawMart - a comprehensive pet adoption and pet care marketplace. It provides RESTful endpoints for managing users, listings, orders, and administrative functions.

---

## ✨ API Features

### 🔐 User Management
- Create/Update user profiles
- Role-based access control (User, Seller, Admin)
- Admin promotion endpoint
- User status management (Active/Blocked)

### 📦 Listings Management
- CRUD operations for pet/product listings
- Category-based filtering
- User-specific listing queries
- Newest-first sorting

### 🛒 Orders Management
- Create and track orders
- Order status updates (Pending → Processing → Completed)
- User-specific order history
- Admin order overview

### 📊 Admin Dashboard
- Platform statistics
- User role distribution
- Total listings and orders count

### 🔧 Utility Endpoints
- Demo user seeding
- Admin setup

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **Database** | MongoDB Atlas |
| **ODM** | MongoDB Node Driver |
| **Environment** | dotenv |
| **CORS** | cors middleware |

---

## 📡 API Endpoints

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/listings` | Get all listings |
| GET | `/listings?category=Pets` | Get listings by category |
| GET | `/listings?limit=6` | Get limited listings |
| GET | `/listings/:id` | Get single listing |
| POST | `/listings` | Create new listing |
| PUT | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Delete listing |
| GET | `/my-listings?email=user@email.com` | Get user's listings |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders (Admin) |
| POST | `/orders` | Create new order |
| GET | `/my-orders?email=user@email.com` | Get user's orders |
| PATCH | `/orders/:id` | Update order status |
| DELETE | `/orders/:id` | Delete order |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (Admin) |
| GET | `/users/:id` | Get user by ID |
| GET | `/users/email/:email` | Get user by email |
| GET | `/users/admin/:email` | Check if user is admin |
| GET | `/users/seller/:email` | Check if user is seller |
| POST | `/users` | Create/Update user |
| PATCH | `/users/role/:id` | Update user role (Admin) |
| PATCH | `/users/status/:id` | Update user status (Admin) |
| PATCH | `/users/:id` | Update user profile |
| DELETE | `/users/:id` | Delete user (Admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get platform statistics |
| POST | `/admin/setup` | Promote user to admin |
| POST | `/seed/demo-user` | Create demo user |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/paw_mart_server.git
cd paw_mart_server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# MongoDB Connection URI
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawmartDB?retryWrites=true&w=majority

# Port (optional, defaults to 5000)
PORT=5000
```

### 4. Run Development Server
```bash
npm start
# or with nodemon
nodemon index.js
```

---

## 🌐 Deployment (Vercel)

### Vercel Configuration
The project includes `vercel.json` for serverless deployment:
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.js"
    }
  ]
}
```

### Deployment Steps
1. Push code to GitHub
2. Connect repository to Vercel
3. Add `DB_URI` environment variable in Vercel dashboard
4. Deploy automatically on push

---

## 📂 Project Structure

```
server/
├── index.js            # Main server file with all routes
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel deployment config
├── .env                # Environment variables (not in repo)
├── .env.example        # Environment template
└── README.md           # Documentation
```

---

## 🔐 CORS Configuration

The server is configured to accept requests from:
- `http://localhost:5173` (Local development)
- `http://localhost:5174` (Alternative port)
- `https://paw-mart-client-beta.vercel.app` (Production)
- Additional Vercel preview URLs

---

## 🎯 Demo User

Seed a demo user for testing:
```bash
curl -X POST http://localhost:5000/seed/demo-user
```

Response:
```json
{
  "success": true,
  "message": "Demo user created successfully!",
  "credentials": {
    "email": "demo@pawmart.com",
    "password": "Demo@123",
    "role": "user"
  }
}
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String,
  name: String,
  photo: String,
  role: "user" | "seller" | "admin",
  status: "active" | "blocked",
  phone: String,
  address: String,
  bio: String,
  createdAt: Date,
  lastLogin: Date
}
```

### Listings Collection
```javascript
{
  name: String,
  category: "Pets" | "Pet Food" | "Accessories" | "Pet Care Products",
  price: Number,
  location: String,
  description: String,
  image: String,
  email: String,
  date: Date
}
```

### Orders Collection
```javascript
{
  listingId: String,
  listingName: String,
  email: String,
  buyerName: String,
  phone: String,
  address: String,
  notes: String,
  status: "pending" | "processing" | "completed",
  createdAt: Date
}
```

---

## 📞 Support

For any queries, please visit the frontend website or check the [client repository](https://github.com/your-username/paw_mart_client).

---

<div align="center">

**Developed with ❤️ for pet lovers everywhere**

🐕 🐈 🐦 🐰 🐹

</div>
