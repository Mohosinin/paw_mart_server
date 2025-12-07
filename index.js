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
    app.post('/orders', async (req, res) => {
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.send(result);
    });

    app.get('/my-orders', async (req, res) => {
        let query = {};
        if (req.query.email) {
            query = { email: req.query.email };
        }
        const result = await ordersCollection.find(query).toArray();
        res.send(result);
    });

    app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        res.send(result);
    });

    // ------------------------------------
    // Users Routes (From Snippet)
    // ------------------------------------
    app.get('/users', async (req, res) => {
        const cursor = usersCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.findOne(query);
        res.send(result);
    });

    app.post('/users', async (req, res) => {
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
    });

    app.patch('/users/:id', async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const query = { _id: new ObjectId(id) };
        const update = {
            $set: {
                name: updatedUser.name,
                email: updatedUser.email
            }
        };
        const result = await usersCollection.updateOne(query, update);
        res.send(result);
    });

    app.delete('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
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
