const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@biplob.whidwsu.mongodb.net/?retryWrites=true&w=majority&appName=Biplob`;

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
      await client.connect();

      const productCollection = client.db("sadik-shop").collection("products");

      app.get('/allProducts', async (req, res) => {
        const { page = 1, search = '', category = '', brand = '', priceRange = '', sort = '' } = req.query;
        const pageSize = 9; // Number of products per page
        const skip = (page - 1) * pageSize;
    
        let query = {};
    
        if (search) {
            query.productName = { $regex: search, $options: 'i' };
        }
    
        if (category) {
            query.category = category;
        }
    
        if (brand) {
            query.brand = brand;
        }
    
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            query.price = { $gte: minPrice, $lte: maxPrice };
        }
    
        let sortOption = {};
        if (sort === 'price-asc') {
            sortOption.price = 1;
        } else if (sort === 'price-desc') {
            sortOption.price = -1;
        } else if (sort === 'date-desc') {
            sortOption.productCreationDate = -1;
        }
    
        try {
            const products = await productCollection
                .find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(pageSize)
                .toArray();
    
            res.send({ products });
        } catch (error) {
            res.status(500).send({ error: 'Failed to fetch products' });
        }
    });
    


      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('sadik-shop server is running')
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})