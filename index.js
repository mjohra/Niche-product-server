const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vamyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("connected to database");
    const database = client.db("nicheProduct");
    const productCollection = database.collection("products");
    const bookingCollection = database.collection("booking");
    const usersCollection = database.collection("users");
    const reviewCollection = database.collection("review");

    // POST API
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      console.log("hit the post api", product);

      const result = await productCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });
    // GET API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });
    // GET Single products
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific product", id);
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });
    //add order
    app.post("/addOrder", async (req, res) => {
      const booking = req.body;
      console.log("hit the post order api", booking);

      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.json(result);
    });

    //get all order
    app.get("/allbooking", async (req, res) => {
      const cursor = bookingCollection.find({});
      const order = await cursor.toArray();
      res.send(order);
    });
    //get single user order
    app.get("/booking", async (req, res) => {
      const email = req.query.email;
      const query = { "users.email": email };
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    //update API

    app.put("/booking/:id", async (req, res) => {
      const id = req.params.id;
      console.log("updating user", id);
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await bookingCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // DELETE ORDER API
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
    // DELETE ORDER API
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });

    //add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.json(result);
    });

    //admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log(user, "put");
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.json(result);
    });
    //verify admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
     const user = await usersCollection.findOne(query);
     console.log(user);
     let isAdmin = false;
     if (user?.role === 'admin') {
          isAdmin = true;
      }
     res.json({ admin: isAdmin });
   });
   //add user review
   app.post("/addReview", async (req, res) => {
    const review = req.body;
    console.log("hit the post review api", review);
    const result = await reviewCollection.insertOne(review);
    console.log(result);
    res.json(result);
  });

   // GET review
   app.get("/review", async (req, res) => {
    const cursor = reviewCollection.find({});
    const review = await cursor.toArray();
    res.send(review);
  });

  } finally {
    //await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running product server");
});

app.listen(port, () => {
  console.log("running niche product server on port", port);
});
