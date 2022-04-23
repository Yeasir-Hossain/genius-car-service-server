const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_YEASIR}:${process.env.DB_PASS}@cluster0.nklab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const serviceCOllection = client.db('geniusCar').collection('service');

    //get all data
    app.get('/service', async (req, res) => {
      const query = {}
      const cursor = serviceCOllection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    })

    //get single data
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const service = await serviceCOllection.findOne(query)
      res.send(service);
    })


    //POST
    app.post('/service', async (req, res) => {
      const newService = req.body;
      const result = await serviceCOllection.insertOne(newService)
      res.send(result);
    })

    //DELETE
    app.delete('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCOllection.deleteOne(query);
      res.send(result);
    });

  }
  finally {

  }
}


run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Running server")
})



app.listen(port, () => {
  console.log("Listening to port", port);
})