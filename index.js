const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const app = express();
var jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ok2nv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next) {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeaders.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const collection = client.db("eubrics").collection("collection");
    const noteCollection = client.db("eubrics").collection("note");

    //AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;

      const token = jwt.sign({ user }, process.env.ACCESS_TOKEN, {
        expiresIn: "30d",
      });
      res.send({ token });
    });

    //SERVICES
    app.get("/collection", verifyJWT, async (req, res) => {
      const result = await collection.find().toArray();
      res.send(result);
    });

    app.get("/collection/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await collection.findOne(query);
      res.send(result);
    });
    app.post("/note", verifyJWT, async (req, res) => {
      const note = req.body;
      const doc = note;
      const result = await noteCollection.insertOne(doc);
      res.send(result);
    });
    app.get("/note", verifyJWT, async (req, res) => {
      const name = req.query.name;
      const email = req.query.email;
      const query = { name, email };
      if (name && email) {
        const result = await noteCollection.find(query).toArray();
        res.send(result);
      }
    });
    app.delete("/note/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await noteCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/notes/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await noteCollection.findOne(query);
      res.send(result);
    });
    app.put("/notes/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const task = req.body.task;
      console.log(task, query);
      const options = { upsert: true };
      const updateDoc = {
        $set: { task },
      };
      const result = await noteCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome to eubrics app");
});

app.listen(port, () => {
  console.log("listening to port", port);
});
