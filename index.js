const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())
function verifyJWT(req,res,next){
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if(!authHeader){
    return res.status(401).send({message:'Unauthorized Access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(403).send({message:'Forbidden Access'})
    }
    req.decoded = decoded;
    next()
  })
  
}


const uri = `mongodb+srv://${process.env.DB_YEASIR}:${process.env.DB_PASS}@cluster0.nklab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const serviceCOllection = client.db('geniusCar').collection('service');
    const orderCollection = client.db('geniusCar').collection('order');


    //AUTH
    app.post('/login',async(req,res)=>{
      const user = req.body;
      const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '1d'
      })
      res.send({accessToken});
    })


    //Services API
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


    //ORDER COLLECTION

    app.get('/order', verifyJWT ,async(req,res)=>{
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if(email === decodedEmail){
      const query = {email:email};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
      }
      else{
        res.status(403).send({message:"Forbidden Access"})
      }
    })

    app.post('/order',async(req,res)=>{
      const order = req.body;
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })

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