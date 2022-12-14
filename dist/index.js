"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = exports.server = exports.io = exports.dbThree = exports.dbTwo = exports.db = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const express_graphql_1 = require("express-graphql");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const schemas_1 = __importDefault(require("./graphql/schemas"));
const resolvers_1 = require("./graphql/resolvers");
const sqlite3 = require("sqlite3").verbose();
const sqlite_1 = require("sqlite");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const dotenv = __importStar(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const https = require("https");
const http = require("http");
const app = (0, express_1.default)();
dotenv.config();
let originsAdress = "https://bottleluminousfront.herokuapp.com";
let allowedOrigins = [
    "https://bottleluminousfront.herokuapp.com",
    "http://localhost:3000",
];
/////////////////////////////////////Sven's//Coding/ Date: 22-11-2022 13:23 ////////////
// login to mongoose
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
console.log(process.env.MONGO_URI);
const mongooseLogin = process.env.MONGO_URI;
const DataBaseConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(mongooseLogin);
        console.log("Connection established with mongo");
    }
    catch (error) {
        console.log("DB error", error);
    }
});
const transport = {
    //this is the authentication for sending email.
    host: "smtp.zoho.eu",
    port: 465,
    secure: true,
    //create a .env file and define the process.env variables
    auth: {
        user: process.env.SMTP_TO_EMAIL,
        pass: process.env.SMTP_TO_PASSWORD,
    },
};
const transporter = nodemailer_1.default.createTransport(transport);
exports.transporter = transporter;
transporter.verify((error, success) => {
    if (error) {
        //if error happened code ends here
        console.error(error);
    }
    else {
        //this means success
        console.log("Ready to send mail!");
    }
});
DataBaseConnect();
const options = {
    key: fs_1.default.readFileSync("C:/Certbot/live/bottle.hopto.org/privkey.pem"),
    cert: fs_1.default.readFileSync("C:/Certbot/live/bottle.hopto.org/cert.pem"),
};
https.createServer(options, app).listen(8080, () => {
    console.log("server is running at port 8080");
});
const server = https.createServer(options, app);
exports.server = server;
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (origin) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    },
});
exports.io = io;
//  "https://bottleluminousfront.herokuapp.com"
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
        }
        catch (e) {
            // sync handler
            handleError(e);
        }
    };
};
// server or client side
io.on("connect", errorHandler((error) => {
    throw new Error("let's panic", error);
}));
const dbThree = new better_sqlite3_1.default("better.sqlite");
exports.dbThree = dbThree;
const db = new sqlite3.Database("db.sqlite", (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    }
    else {
        console.log("Connected to the SQLite database.");
    }
});
exports.db = db;
let dbTwo;
exports.dbTwo = dbTwo;
(() => __awaiter(void 0, void 0, void 0, function* () {
    // open the database
    exports.dbTwo = dbTwo = yield (0, sqlite_1.open)({
        filename: "dbOpen.sqlite",
        driver: sqlite3.Database,
    });
}))();
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };
// Cors
const corsOptions = {
    origin: function (origin, callback) {
        if (origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
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
    app.use(express_1.default.static("build"));
    app.get("*", (req, res) => {
        req.sendFile(path.resolve(__dirname, "build", "index.html"));
    });
}
// Express
app.use(body_parser_1.default.json());
//app.listen(port);
//server.listen(3000);
//End of Express
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
let socketIdArray = [];
io.on("connect", (socket) => {
    console.log("a user connected");
    socketIdArray.push(socket.id);
    console.log("the socket array", socketIdArray.length != null ? socketIdArray : "empty");
});
io.on("disconnect", (test) => {
    console.log(test);
});
server.listen(8081, () => {
    console.log("listening on *:8081");
});
//GraphQL
app.use("/graphql", (0, express_graphql_1.graphqlHTTP)({
    schema: schemas_1.default,
    rootValue: resolvers_1.graphqlResolver,
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
}));
