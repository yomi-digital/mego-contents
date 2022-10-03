import axios from "axios";
import * as Database from "./libs/database";
import { parseContents, verify, listenEvents } from "./libs/web3";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Init express server
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Init mongo database
const db = new Database.Mongo();
db.createContentsIndex();

// Automatic parsers
async function parsers() {
  listenEvents()
  parseContents()
}
parsers()

// Public endpoints
app.get("/contents/:chain/:instance", async function (req, res) {
  const db = new Database.Mongo();
  const contents = await db.find('contents', { chain: req.params.chain, instance: req.params.instance }, { timestamp: -1 })
  res.send(contents)
})

app.get("/contents/:chain/:instance/:index", async function (req, res) {
  const db = new Database.Mongo();
  const content = await db.find('contents', { chain: req.params.chain, instance: req.params.instance, index: parseInt(req.params.index) })
  res.send(content)
})

app.get("/users/:chain/:instance", async function (req, res) {
  const db = new Database.Mongo();
  const users = await db.find('users', { chain: req.params.chain, instance: req.params.instance, state: true }, { user: 1 })
  res.send(users)
})

// Default endpoint
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(3000, () => {
  console.log(`Mego API running.`);
});
