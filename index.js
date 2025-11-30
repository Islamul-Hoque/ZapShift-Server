const express = require('express')
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 3000

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xue6gdd.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // mongoDB collections
        const db = client.db('Zap_Shift_User');
        const parcelsCollection = db.collection('parcels');

        // get parcels from dashboard
        app.get('/parcels', async (req, res) => {
            const query = {}
            const {email} = req.query;

            if(email){
                query.senderEmail = email;
            }
            const options = { sort: { createdAt: -1 } }

            const cursor = parcelsCollection.find(query, options)
            const result = await cursor.toArray();
            res.send(result);
        })

        // get single parcel from dashboard for details page and payment
        app.get('/parcels/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await parcelsCollection.findOne(query);
            res.send(result);
        })

        // add parcel to dashboard
        app.post('/parcels', async (req, res) => {
            const parcel = req.body;
            parcel.createdAt = new Date() // parcel created time
            const result = await parcelsCollection.insertOne(parcel);
            res.send(result)
        })

        // delete parcel from dashboard
        app.delete('/parcels/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await parcelsCollection.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('zap is shifting shifting!')
})

app.listen(port, () => {
    console.log(`ZapShip listening on port ${port}`)
})