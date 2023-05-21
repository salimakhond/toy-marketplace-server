const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5jtl7ky.mongodb.net/?retryWrites=true&w=majority`;

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

        const toysCollection = client.db('toyMarketPlace').collection('products');

        app.post('/products', async (req, res) => {
            const products = req.body;
            console.log(products);
            const result = await toysCollection.insertOne(products);
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const cursor = toysCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:subCategory', async (req, res) => {
            console.log(req.params.subCategory)
            const cursor = toysCollection.find({ subCategory: req.params.subCategory });
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/product-by-id/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        })

        app.get('/product-by-email/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await toysCollection.find({ email: req.params.email }).sort({price: 1}).toArray();
            res.send(result);
        });


        app.delete('/product-by-email/:id', async (req, res) => {
            const id = req.params.id;
            const result = await toysCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });


        app.put('/product-by-id/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedToys = {
                $set: {
                    toyName: update.toyName,
                    description: update.description,
                    image: update.image,
                    subCategory: update.subCategory,
                    quantity: update.quantity,
                    sellername: update.sellername,
                    rating: update.rating,
                    postedBy: update.postedBy,
                    price: update.price
                }
            }
            const result = await toysCollection.updateOne(query, updatedToys, options);
            res.send(result);
        });

        app.get('/search/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toysCollection.find({ $or: [{ toyName: { $regex: searchText, $options: "i" } }] }).toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Toy Marketplace is Running')
})

app.listen(port, () => {
    console.log(`Toy Marketplace is Running ${port}`)
})