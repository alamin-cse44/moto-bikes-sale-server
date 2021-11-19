const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
// const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

// doctors-portal-firebase-adminsdk.json 
//const serviceAccount = JSON.parse(process.env.FIREBASAE_SERVICE_ACCOUNT);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zslia.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run(){
    try{
      await client.connect();
      const database = client.db('motoBikes');
      const bookingCollection = database.collection('bookings');
      const usersCollection = database.collection('users');
      const homeBikeCollection = database.collection('homeBikes');
      const exploreBikeCollection = database.collection('exploreBikes');
      const reviewCollection = database.collection('reviews');

      // ---------------------  Home Bikes START  ------------------
      // POST FOR HOME BIKES
      app.post('/homeBikes', async(req, res) => {
        const newBike = req.body;
        const result = await homeBikeCollection.insertOne(newBike);
        console.log('added bike', result);
        res.json(result);
      })

      // GET FOR HOME BIKES
      app.get('/homeBikes', async(req, res) => {
        const cursor = homeBikeCollection.find({});
        const bikes = await cursor.toArray();
        res.send(bikes);
      })

      // --------------  Home BIKES END ------------------------------------

      // ------------------- REVIEW START -------------------------------

      // POST FOR REVIEW
      app.post('/reviews', async(req, res) => {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        console.log('review added ', result);
        res.json(result);
      })

      // GET FOR REVIEW
      app.get('/reviews', async(req, res) => {
        const cursor = reviewCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
      })

      // ------------------------- REVIEW END ------------------------------

      // -------------------    START EXPLORE ------------------------------

      // POST FOR EXPLORE BIKES
      app.post('/exploreBikes', async(req, res) => {
        const newBike = req.body;
        const result = await exploreBikeCollection.insertOne(newBike);
        res.json(result)
      })

      // GET FOR EXPLORE BIKES
      app.get('/exploreBikes', async(req, res) => {
        const cursor = exploreBikeCollection.find({});
        const bikes = await cursor.toArray();
        res.send(bikes);
      })

      // GET SPECIFIC EXPLORE BIKES
      app.get('/exploreBikes/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await exploreBikeCollection.findOne(query);
        console.log('load bikes id', id);
        res.send(result);
      })

      // UPDATE SPECIFIC EXPLORE BIKES
      app.put('/exploreBikes/:id', async(req, res) => {
        const id = req.params.id;
        const updateBike = req.body;
        const filter = { _id: ObjectId(id) };
        const options = {upsert: true};
        const updateDoc = {
          $set: {
            name: updateBike.name,
            description: updateBike.description,
            price: updateBike.price,
            img: updateBike.img
          }
        };
        const result = await exploreBikeCollection.updateOne(filter, updateDoc, options);
        console.log('updating');
        res.json(result);
      })

      // DELETE FOR EXPLORE BIKES
      app.delete('/exploreBikes/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await exploreBikeCollection.deleteOne(query);
        console.log('deleting bike ', result);
        res.json(result);
      })

      // -----------------------  END EXPLORE ------------------------------------

      // ------------------------- START BOOKING ---------------------------------

      // GET FOR BOOKING PRODUCT with specific email and date
      app.get('/bookings', async(req, res) => {
        const email = req.query.email;
        const date = new Date(req.query.date).toLocaleDateString();
        const query = {email: email, date: date};
        console.log(query);
        const cursor = bookingCollection.find(query);
        const bookings = await cursor.toArray();
        res.json(bookings);
      })

      // GET FOR BOOKING PRODUCT
      app.get('/allbookings', async(req, res) => {
        const cursor = bookingCollection.find({});
        const bikes = await cursor.toArray();
        res.send(bikes);
      })

      // DELETE FOR BOOKINGS BIKES
      app.delete('/allbookings/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await bookingCollection.deleteOne(query);
        console.log('deleting bike ', result);
        res.json(result);
      })

      // POST FOR BOOKINGS PRODUCT
      app.post('/bookings', async(req, res)=>{
         const booking = req.body;
         const result = await bookingCollection.insertOne(booking);
         console.log(booking);
         res.json(result);
      })

      // GET  FOR BOOKING SINGLE PRODUCT ***
      app.get('/bookings/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await bookingCollection.findOne(query);
        console.log('deleting bike ', result);
        res.json(result);
      })

      // DELETE  FOR BOOKING SINGLE PRODUCT ***
      app.delete('/bookings/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await bookingCollection.deleteOne(query);
        console.log('deleting bike ', result);
        res.json(result);
      })

      // ----------------------- END BOOKINGS ---------------------------

      // ---------------------- START USER -------------------------------

      // POST USERS IN DATABASE
      app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
      });

      // UPSERT USER FOR GOOGLE SIGN IN USER
      app.put('/users', async(req, res) => {
        const user = req.body;
        const filter = {email: user.email};
        const options = {upsert: true};
        const updateDoc = {$set: user};
        const result = await usersCollection.updateOne(filter,updateDoc,options);
        res.json(result);
      })

      // PUT FOR MAKE AN ADMIN
      app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        const filter = {email: user.email};
        const updateDoc = {$set: {role: 'admin'}};
        const result= await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })

      // CHECK ADMIN
      app.get('/users/:email', async (req, res)=>{
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin: isAdmin});
      })
    
      // ------------------- END USER --------------------------


    }
    finally{
      // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to moto bike show room!')
  })
  
  app.listen(port, () => {
    console.log(`listening at ${port}`)
  })