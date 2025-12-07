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
app.options('*', cors());
app.use(express.json());

// MongoDB Configuration
const uri = process.env.DB_URI;
const client = uri ? new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}) : null;

// Database State
let db;
let listingsCollection;
let ordersCollection;
let usersCollection;
let dbConnectionPromise = null;

// Connection Helper
async function connectDB() {
    if (!client) {
        throw new Error("DB_URI is undefined or client failed to initialize.");
    }
    if (!dbConnectionPromise) {
        dbConnectionPromise = (async () => {
            try {
                if (db) return db; // already connected
                await client.connect();
                db = client.db('pawmartDB');
                listingsCollection = db.collection('listings');
                ordersCollection = db.collection('orders');
                usersCollection = db.collection('users');
                console.log("Successfully connected to MongoDB!");
                return db;
            } catch (error) {
                console.error("MongoDB connection error:", error);
                dbConnectionPromise = null; // Reset on failure
                throw error;
            }
        })();
    }
    return dbConnectionPromise;
}

// Route Wrapper for Safe Execution
const runSafe = (handler) => async (req, res, next) => {
    try {
        await connectDB();
        await handler(req, res, next);
    } catch (error) {
        console.error(`Error in ${req.method} ${req.path}:`, error);
        res.status(500).send({ 
            error: 'Internal Server Error', 
            message: error.message 
        });
    }
};

// =======================
//       Listings
// =======================

app.get('/listings', runSafe(async (req, res) => {
    const limit = parseInt(req.query.limit) || 0;
    let query = {};
    if (req.query.category) {
        query = { category: req.query.category };
    }
    const result = await listingsCollection.find(query).sort({ _id: -1 }).limit(limit).toArray();
    res.send(result);
}));

app.get('/listings/:id', runSafe(async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID format" });
    }
    const query = { _id: new ObjectId(id) };
    const result = await listingsCollection.findOne(query);
    res.send(result);
}));

app.post('/listings', runSafe(async (req, res) => {
    const listing = req.body;
    // Basic validation could go here
    const result = await listingsCollection.insertOne(listing);
    res.send(result);
}));

app.get('/my-listings', runSafe(async (req, res) => {
    let query = {};
    if (req.query.email) {
        query = { email: req.query.email };
    }
    const result = await listingsCollection.find(query).toArray();
    res.send(result);
}));

app.delete('/listings/:id', runSafe(async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ error: "Invalid ID" });
    const query = { _id: new ObjectId(id) };
    const result = await listingsCollection.deleteOne(query);
    res.send(result);
}));

app.put('/listings/:id', runSafe(async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ error: "Invalid ID" });
    
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedListing = req.body;
    
    // Construct strict update object to prevent unwanted field injection
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
}));

//        Orders

app.post('/orders', runSafe(async (req, res) => {
    const order = req.body;
    const result = await ordersCollection.insertOne(order);
    res.send(result);
}));

app.get('/my-orders', runSafe(async (req, res) => {
    let query = {};
    if (req.query.email) {
        query = { email: req.query.email };
    }
    const result = await ordersCollection.find(query).toArray();
    res.send(result);
}));

app.delete('/orders/:id', runSafe(async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ error: "Invalid ID" });
    const query = { _id: new ObjectId(id) };
    const result = await ordersCollection.deleteOne(query);
    res.send(result);
}));

// Base Route
app.get('/', (req, res) => {
    res.send('PawMart Server is running');
});

// Start Server
if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(port, () => {
        console.log(`PawMart Server is running on port ${port}`);
    });
}
