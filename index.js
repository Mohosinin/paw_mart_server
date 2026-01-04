const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://paw-mart-client-beta.vercel.app',
        'https://paw-mart-client-i3xk2jmrh-mohosinins-projects.vercel.app',
    ],
    credentials: true
}));
app.use(express.json());

const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db('pawmartDB');
    const listingsCollection = db.collection('listings');
    const ordersCollection = db.collection('orders');
    const usersCollection = db.collection('users');

    // ------------------------------------
    // Listings Routes
    // ------------------------------------
    app.get('/listings', async (req, res) => {
        const limit = parseInt(req.query.limit) || 0;
        let query = {};
        if (req.query.category) {
            query = { category: req.query.category };
        }
        const result = await listingsCollection.find(query).sort({ _id: -1 }).limit(limit).toArray();
        res.send(result);
    });

    app.get('/listings/:id', async (req, res) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: "Invalid ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await listingsCollection.findOne(query);
        res.send(result);
    });

    app.post('/listings', async (req, res) => {
        const listing = req.body;
        const result = await listingsCollection.insertOne(listing);
        res.send(result);
    });

    app.get('/my-listings', async (req, res) => {
        let query = {};
        if (req.query.email) {
            query = { email: req.query.email };
        }
        const result = await listingsCollection.find(query).toArray();
        res.send(result);
    });

    app.delete('/listings/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await listingsCollection.deleteOne(query);
        res.send(result);
    });

    app.put('/listings/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedListing = req.body;
        
        const listing = {
            $set: {
                name: updatedListing.name,
                category: updatedListing.category,
                price: updatedListing.price,
                location: updatedListing.location,
                description: updatedListing.description,
                image: updatedListing.image,
                date: updatedListing.date
            }
        };
        const result = await listingsCollection.updateOne(filter, listing, options);
        res.send(result);
    });

    // ------------------------------------
    // Orders Routes
    // ------------------------------------
    
    // Get all orders (admin)
    app.get('/orders', async (req, res) => {
        const result = await ordersCollection.find().sort({ _id: -1 }).toArray();
        res.send(result);
    });
    
    app.post('/orders', async (req, res) => {
        const order = req.body;
        order.status = 'pending';
        order.createdAt = new Date();
        const result = await ordersCollection.insertOne(order);
        res.send(result);
    });

    app.get('/my-orders', async (req, res) => {
        let query = {};
        if (req.query.email) {
            query = { email: req.query.email };
        }
        const result = await ordersCollection.find(query).sort({ _id: -1 }).toArray();
        res.send(result);
    });

    // Update order status (admin)
    app.patch('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const { status } = req.body;
        const query = { _id: new ObjectId(id) };
        const update = { $set: { status: status } };
        const result = await ordersCollection.updateOne(query, update);
        res.send(result);
    });

    app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        res.send(result);
    });

    // ------------------------------------
    // Users Routes with Role-Based Access
    // ------------------------------------
    
    // Get all users (admin only in frontend)
    app.get('/users', async (req, res) => {
        const result = await usersCollection.find().sort({ createdAt: -1 }).toArray();
        res.send(result);
    });

    // Get user by ID
    app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.findOne(query);
        res.send(result);
    });

    // Get user by email
    app.get('/users/email/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const result = await usersCollection.findOne(query);
        res.send(result || { role: 'user' });
    });

    // Check if user is admin
    app.get('/users/admin/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        const isAdmin = user?.role === 'admin';
        res.send({ admin: isAdmin });
    });

    // Check if user is seller
    app.get('/users/seller/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        const isSeller = user?.role === 'seller' || user?.role === 'admin';
        res.send({ seller: isSeller });
    });

    // Create or update user on login/register
    app.post('/users', async (req, res) => {
        const newUser = req.body;
        const query = { email: newUser.email };
        const existingUser = await usersCollection.findOne(query);
        
        if (existingUser) {
            // Update last login
            const update = { $set: { lastLogin: new Date() } };
            await usersCollection.updateOne(query, update);
            return res.send({ message: 'User already exists', insertedId: null, user: existingUser });
        }
        
        // Add default role and timestamps for new user
        const userWithDefaults = {
            ...newUser,
            role: newUser.role || 'user',
            status: 'active',
            createdAt: new Date(),
            lastLogin: new Date()
        };
        
        const result = await usersCollection.insertOne(userWithDefaults);
        res.send(result);
    });

    // Update user role (admin only)
    app.patch('/users/role/:id', async (req, res) => {
        const id = req.params.id;
        const { role } = req.body;
        
        if (!['admin', 'seller', 'user'].includes(role)) {
            return res.status(400).send({ error: 'Invalid role' });
        }
        
        const query = { _id: new ObjectId(id) };
        const update = { $set: { role: role } };
        const result = await usersCollection.updateOne(query, update);
        res.send(result);
    });

    // Update user status (active/blocked)
    app.patch('/users/status/:id', async (req, res) => {
        const id = req.params.id;
        const { status } = req.body;
        
        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).send({ error: 'Invalid status' });
        }
        
        const query = { _id: new ObjectId(id) };
        const update = { $set: { status: status } };
        const result = await usersCollection.updateOne(query, update);
        res.send(result);
    });

    // Update user profile
    app.patch('/users/:id', async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const query = { _id: new ObjectId(id) };
        const update = {
            $set: {
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                bio: updatedUser.bio,
                photo: updatedUser.photo
            }
        };
        const result = await usersCollection.updateOne(query, update);
        res.send(result);
    });

    // Delete user (admin only)
    app.delete('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
    });

    // Get stats for admin dashboard
    app.get('/admin/stats', async (req, res) => {
        const totalUsers = await usersCollection.countDocuments();
        const totalListings = await listingsCollection.countDocuments();
        const totalOrders = await ordersCollection.countDocuments();
        const adminCount = await usersCollection.countDocuments({ role: 'admin' });
        const sellerCount = await usersCollection.countDocuments({ role: 'seller' });
        const userCount = await usersCollection.countDocuments({ role: 'user' });
        
        res.send({
            totalUsers,
            totalListings,
            totalOrders,
            adminCount,
            sellerCount,
            userCount
        });
    });

    // Setup endpoint - Make a user admin by email
    // Usage: POST /admin/setup with { email: "your-email@example.com", secretKey: "pawmart-admin-setup" }
    app.post('/admin/setup', async (req, res) => {
        const { email, secretKey } = req.body;
        
        // Simple secret key protection (change this in production!)
        if (secretKey !== 'pawmart-admin-setup-2024') {
            return res.status(403).send({ error: 'Invalid secret key' });
        }
        
        const query = { email: email };
        const existingUser = await usersCollection.findOne(query);
        
        if (!existingUser) {
            return res.status(404).send({ error: 'User not found. Please register first.' });
        }
        
        const update = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(query, update);
        
        if (result.modifiedCount > 0) {
            res.send({ success: true, message: `${email} is now an admin!` });
        } else {
            res.send({ success: false, message: 'User is already an admin or update failed' });
        }
    });

    // Seed demo user endpoint
    // This creates/updates a demo user with 'user' role for testing purposes
    app.post('/seed/demo-user', async (req, res) => {
        const demoUser = {
            email: 'demo@pawmart.com',
            name: 'Demo User',
            photo: 'https://i.pravatar.cc/150?img=3',
            role: 'user',
            status: 'active',
            phone: '+1234567890',
            address: '123 Pet Street, Animal City',
            bio: 'I am a demo user for testing PawMart features!',
            createdAt: new Date(),
            lastLogin: new Date()
        };

        const query = { email: demoUser.email };
        const existingUser = await usersCollection.findOne(query);

        if (existingUser) {
            // Update existing demo user
            const update = { 
                $set: { 
                    ...demoUser,
                    lastLogin: new Date() 
                } 
            };
            await usersCollection.updateOne(query, update);
            res.send({ 
                success: true, 
                message: 'Demo user updated successfully!',
                credentials: {
                    email: 'demo@pawmart.com',
                    password: 'Demo@123',
                    role: 'user'
                }
            });
        } else {
            // Create new demo user
            const result = await usersCollection.insertOne(demoUser);
            res.send({ 
                success: true, 
                message: 'Demo user created successfully!',
                insertedId: result.insertedId,
                credentials: {
                    email: 'demo@pawmart.com',
                    password: 'Demo@123',
                    role: 'user'
                }
            });
        }
    });



  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('PawMart Server is running');
});

if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(port, () => {
        console.log(`PawMart Server is running on port ${port}`);
    });
}
