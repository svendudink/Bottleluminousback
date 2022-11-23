import express from "express";
import fs from "fs";
import { graphqlHTTP } from "express-graphql";
import bodyParser from "body-parser";
import cors from "cors";
import graphqlSchema from "./graphql/schemas";
import { graphqlResolver } from "./graphql/resolvers";
const sqlite3 = require("sqlite3").verbose();
import { open } from "sqlite";
import Database from "better-sqlite3";
const https = require("https");
const http = require("http");
const app = express();

const options = {
  key: fs.readFileSync("C:/Certbot/live/bottle.hopto.org/privkey.pem"),
  cert: fs.readFileSync("C:/Certbot/live/bottle.hopto.org/cert.pem"),
};

https.createServer(options, app).listen(8080, () => {
  console.log("server is running at port 8080");
});

const server = https.createServer(options, app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "https://bottleluminousfront.herokuapp.com",
  },
});

const errorHandler = (handler) => {
  const handleError = (err) => {
    console.error("please handle me", err);
  };

  return (...args) => {
    try {
      const ret = handler.apply(this, args);
      if (ret && typeof ret.catch === "function") {
        // async handler
        ret.catch(handleError);
      }
    } catch (e) {
      // sync handler
      handleError(e);
    }
  };
};

// server or client side
io.on(
  "connect",
  errorHandler((error) => {
    throw new Error("let's panic", error);
  })
);

const dbThree = new Database("better.sqlite");

const db = new sqlite3.Database("db.sqlite", (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
  }
});
let dbTwo;
(async () => {
  // open the database
  dbTwo = await open({
    filename: "dbOpen.sqlite",
    driver: sqlite3.Database,
  });
})();

// Cors
const corsOptions = {
  origin: "https://bottleluminousfront.herokuapp.com",
  credentials: true,
};
app.use(cors(corsOptions));
// End of Cors

const port = 8080;
/////////////////////////////////////Sven's//Coding/ Date: 21-10-2022 15:33 ////////////
// Videostreamer
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

// app.set("view engine", "ejs");

app.get("/", (req, res, next) => {
  res.render("index");
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));
  app.get("*", (req, res) => {
    req.sendFile(path.resolve(__dirname, "build", "index.html"));
  });
}

// Express
app.use(bodyParser.json());

//app.listen(port);
//server.listen(3000);
//End of Express
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let socketIdArray = [];

io.on("connect", (socket) => {
  console.log("a user connected");
  console.log(socket.id);
  socketIdArray.push(socket.id);
  console.log(socketIdArray[socketIdArray.length - 2] != null);
});

io.on("connect", (test) => {
  console.log("test");
});

server.listen(8081, () => {
  console.log("listening on *:8081");
});

//GraphQL
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "an error occured";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

// end of GraphQL

/////////////////////////////////////Sven's//Coding/ Date: 21-10-2022 12:18 ////////////
// Livestream video
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

export { db, dbTwo, dbThree, io, server };
