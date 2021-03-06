const { MongoClient } = require("mongodb");
require("dotenv").config();
const fs = require("fs");

module Database {
  export class Mongo {
    client: any;
    dbOptions = {
      useUnifiedTopology: true,
      //   sslValidate: false,
      //   sslCA: "./ca-certificate.crt",
      //   sslCA: "./" + process.env.ENVIRONMENT + "-ca.crt"
    };

    public find(collection, query = {}, sort?): any {
      return new Promise(async (response) => {
        try {
          // let ssl = "&ssl=true";
          // if (process.env.MONGODB_CONNECTION?.indexOf("localhost") !== -1) {
          //   ssl = "";
          // }
          // const cert = await fs.readFileSync("./ca-certificate.crt");
          let client = new MongoClient(
            process.env.MONGODB_CONNECTION,
            this.dbOptions
          );
          await client.connect();
          const db = await client.db(process.env.MONGODB_DBNAME);
          let result;
          if (sort !== undefined) {
            result = await db
              .collection(collection)
              .find(query)
              .sort(sort)
              .toArray();
          } else {
            result = await db.collection(collection).findOne(query);
          }
          await client.close();
          response(result);
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE FINDING.");
        }
      });
    }

    public insert(collection, document): any {
      return new Promise(async (response) => {
        try {
          // let ssl = "?ssl=true";
          // if (process.env.MONGODB_CONNECTION?.indexOf("localhost") !== -1) {
          //   ssl = "";
          // }
          let client = new MongoClient(
            process.env.MONGODB_CONNECTION,
            this.dbOptions
          );
          await client.connect();
          const db = await client.db(process.env.MONGODB_DBNAME);
          let result = await db.collection(collection).insertOne(document);
          await client.close();
          response(result);
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE INSERTING.");
          response(false);
        }
      });
    }

    public update(collection, query, document): any {
      return new Promise(async (response) => {
        try {
          // let ssl = "?ssl=true";
          // if (process.env.MONGODB_CONNECTION?.indexOf("localhost") !== -1) {
          //   ssl = "";
          // }
          let client = new MongoClient(
            process.env.MONGODB_CONNECTION,
            this.dbOptions
          );
          await client.connect();
          const db = await client.db(process.env.MONGODB_DBNAME);
          await db.collection(collection).updateOne(query, document);
          let result = await db.collection(collection).findOne(query, document);
          await client.close();
          response(result);
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE UPDATING.");
          response(false);
        }
      });
    }

    public createContentsIndex() {
      return new Promise(async (response) => {
        try {
          // let ssl = "?ssl=true";
          // if (process.env.MONGODB_CONNECTION?.indexOf("localhost") !== -1) {
          //   ssl = "";
          // }
          let client = new MongoClient(
            process.env.MONGODB_CONNECTION,
            this.dbOptions
          );
          await client.connect();
          const db = await client.db(process.env.MONGODB_DBNAME);
          let createIndex = await db.collection("contents").createIndex({
            owner: "text",
            instance: "text"
          });
          await client.close();
          response(createIndex);
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE SEARCHING.");
          response(false);
        }
      });
    }
  }
}

export = Database;
