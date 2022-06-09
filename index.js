const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const app = express();
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
async function run() {
  try {
    await client.connect();
    const collection = client.db("eubrics").collection("collection");
    const noteCollection = client.db("eubrics").collection("note");
    app.get("/collection", async (req, res) => {
      const result = await collection.find().toArray();
      res.send(result);
    });
    app.get("/collection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await collection.findOne(query);
      res.send(result);
    });
    app.post("/note", async (req, res) => {
      const note = req.body;
      const doc = note;
      const result = await noteCollection.insertOne(doc);
      res.send(result);
    });
    app.get("/note", async (req, res) => {
      const name = req.query.name;
      const email = req.query.email;
      const query = { name, email };
      if (name && email) {
        const result = await noteCollection.find(query).toArray();
        res.send(result);
      }
    });
    app.delete('/note/:id',async(req,res)=>{
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result=await noteCollection.deleteOne(query)
        res.send(result)
    })

    app.get("/notes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await noteCollection.findOne(query);
      res.send(result);
    });
    app.put('/notes/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const task=req.body.task
      console.log(task,query);
      const options = { upsert: true };
      const updateDoc = {
        $set: {task},
      };
      const result = await noteCollection.updateOne(query, updateDoc, options);
      res.send(result)
    })
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
