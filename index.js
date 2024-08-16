const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const e = require('express');
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.KEY}:${process.env.KEY}@cluster0.rth5hqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const productsCollection = client.db("jobtask1").collection('products');
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        // get product
        app.get('/products', async (req, res) => {

            try {
                const page = parseInt(req.query.page);
                const size = parseInt(req.query.size);
                const search = req.query.search || '';

                const { category, brand, minPrice, maxPrice } = JSON.parse(req.query.filter);
                const sort = JSON.parse(req.query.sort);



                let filter = {};

                if (search) {
                    filter.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        
                        // Add more fields for searching as needed
                    ];
                }

                if (category) filter.category = category;
                if (category) filter.category = category;
                if (brand) filter.brand = brand;
                if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
                if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

                console.log(filter);
                const sortField = sort?.sortField || 'createdAt';
                const sortOrder = sort?.sortOrder === 'asc' ? 1 : -1;

                
                const result = await productsCollection.find(filter).sort({ [sortField]: sortOrder })
                    .skip(size * (page - 1))
                    .limit(size)
                    .toArray();

                    const count = await productsCollection.estimatedDocumentCount();


                res.json({
                    success: true,
                    data: result,
                    count: count
                })
            } catch (err) {
                res.json({
                    success: false,
                    error: err.message
                })
            }
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
    res.send("welcome to server");
});

app.listen(port, () => console.log(`Server running on port ${port}`));