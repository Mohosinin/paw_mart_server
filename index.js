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
        'https://paw-mart-client-ugad.vercel.app',
        'https://paw-mart-client-ugad-git-main-yourusername.vercel.app'
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

// Database collections
let db, listingsCollection, ordersCollection, usersCollection;
let dbConnectionPromise = null;

// Connect to MongoDB
async function connectDB() {
  if (!dbConnectionPromise) {
    dbConnectionPromise = (async () => {
      try {
        await client.connect();
        db = client.db('pawmartDB');
        listingsCollection = db.collection('listings');
        ordersCollection = db.collection('orders');
        usersCollection = db.collection('users');
        console.log("Successfully connected to MongoDB!");
        return true;
      } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
      }
    })();
  }
  return dbConnectionPromise;
}

// Initialize DB connection
connectDB();

// Listings APIs
app.get('/listings', async (req, res) => {
    try {
        await connectDB();
        const limit = parseInt(req.query.limit) || 0;
        let query = {};
        if (req.query.category) {
            query = { category: req.query.category };
        }
        const result = await listingsCollection.find(query).sort({ _id: -1 }).limit(limit).toArray();
        res.send(result);
    } catch (error) {
        console.error('Error in /listings:', error);
        res.status(500).send({ error: 'Failed to fetch listings', message: error.message });
    }
});

app.get('/listings/:id', async (req, res) => {
    try {
        await connectDB();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await listingsCollection.findOne(query);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch listing', message: error.message });
    }
});

app.post('/listings', async (req, res) => {
    try {
        await connectDB();
        const listing = req.body;
        const result = await listingsCollection.insertOne(listing);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create listing', message: error.message });
    }
});

app.get('/my-listings', async (req, res) => {
    try {
        await connectDB();
        let query = {};
        if (req.query.email) {
            query = { email: req.query.email };
        }
        const result = await listingsCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch listings', message: error.message });
    }
});

app.delete('/listings/:id', async (req, res) => {
    try {
        await connectDB();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await listingsCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete listing', message: error.message });
    }
});

app.put('/listings/:id', async (req, res) => {
    try {
        await connectDB();
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
        }
        const result = await listingsCollection.updateOne(filter, listing, options);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to update listing', message: error.message });
    }
});

// Orders APIs
app.post('/orders', async (req, res) => {
    try {
        await connectDB();
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create order', message: error.message });
    }
});

app.get('/my-orders', async (req, res) => {
    try {
        await connectDB();
        let query = {};
        if (req.query.email) {
            query = { email: req.query.email };
        }
        const result = await ordersCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch orders', message: error.message });
    }
});

app.delete('/orders/:id', async (req, res) => {
    try {
        await connectDB();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete order', message: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('PawMart Server is running');
});

// For Vercel serverless deployment
if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(port, () => {
        console.log(`PawMart Server is running on port ${port}`);
    });
}
