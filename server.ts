import _https from "https";
import _url from "url";
import _fs from "fs";
import _express from "express";
import _dotenv from "dotenv";
import _cors from "cors";
import _fileUpload from "express-fileupload";
// import _cloudinary, { UploadApiResponse } from 'cloudinary';
// import _streamifier from "streamifier";
// import _axios from "axios";
// import _nodemailer from "nodemailer";
// import _bcrypt from "bcryptjs";
// import _jwt from "jsonwebtoken";

// Lettura delle password e parametri fondamentali
_dotenv.config({ "path": ".env" });

// Configurazione Cloudinary
// _cloudinary.v2.config({
//     cloud_name: process.env.cloud_name,
//     api_key: process.env.api_key,
//     api_secret: process.env.api_secret
// });

// Variabili relative a MongoDB ed Express
import { MongoClient, ObjectId } from "mongodb";
import exp from "constants";
import path from "path";
const DBNAME = process.env.DBNAME;
const connectionString: string = process.env.connectionStringAtlas;
const app = _express();

// Creazione ed avvio del server http
// app è il router di Express, si occupa di tutta la gestione delle richieste http
// const HTTP_PORT: number = parseInt(process.env.HTTP_PORT);
// let paginaErrore;
// const http_server = _http.createServer(app);
// // Il secondo parametro facoltativo ipAddress consente di mettere il server in ascolto su una delle interfacce della macchina, se non lo metto viene messo in ascolto su tutte le interfacce (3 --> loopback e 2 di rete)
// http_server.listen(HTTP_PORT, () => {
//     init();
//     console.log(`Server HTTP in ascolto sulla porta ${HTTP_PORT}`);
// });

// Creazione ed avvio del server https, a questo server occorre passare le chiavi RSA (pubblica e privata)
// app è il router di Express, si occupa di tutta la gestione delle richieste https
const HTTPS_PORT: number = parseInt(process.env.HTTPS_PORT);
let paginaErrore;
const PRIVATE_KEY = _fs.readFileSync("./keys/privateKey.pem", "utf8");
const CERTIFICATE = _fs.readFileSync("./keys/certificate.crt", "utf8");
const CREDENTIALS = { "key": PRIVATE_KEY, "cert": CERTIFICATE };
const https_server = _https.createServer(CREDENTIALS, app);
// Il secondo parametro facoltativo ipAddress consente di mettere il server in ascolto su una delle interfacce della macchina, se non lo metto viene messo in ascolto su tutte le interfacce (3 --> loopback e 2 di rete)
https_server.listen(HTTPS_PORT, () => {
    init();
    console.log(`Server HTTPS in ascolto sulla porta ${HTTPS_PORT}`);
});

function init() {
    _fs.readFile("./static/error.html", function (err, data) {
        if (err) {
            paginaErrore = `<h1>Risorsa non trovata</h1>`;
        }
        else {
            paginaErrore = data.toString();
        }
    });
}

//********************************************************************************************//
// Routes middleware
//********************************************************************************************//

// 1. Request log
app.use("/", (req: any, res: any, next: any) => {
    console.log(`-----> ${req.method}: ${req.originalUrl}`);
    next();
});

// 2. Gestione delle risorse statiche
// .static() è un metodo di express che ha già implementata la firma di sopra. Se trova il file fa la send() altrimenti fa la next()
app.use("/", _express.static("./static"));

// 3. Lettura dei parametri POST di req["body"] (bodyParser)
// .json() intercetta solo i parametri passati in json nel body della http request
app.use("/", _express.json({ "limit": "50mb" }));
// .urlencoded() intercetta solo i parametri passati in urlencoded nel body della http request
app.use("/", _express.urlencoded({ "limit": "50mb", "extended": true }));

// 4. Aggancio dei parametri del FormData e dei parametri scalari passati dentro il FormData
// Dimensione massima del file = 10 MB
app.use("/", _fileUpload({ "limits": { "fileSize": (10 * 1024 * 1024) } }));

// 5. Log dei parametri GET, POST, PUT, PATCH, DELETE
app.use("/", (req: any, res: any, next: any) => {
    if (Object.keys(req["query"]).length > 0) {
        console.log(`       ${JSON.stringify(req["query"])}`);
    }
    if (Object.keys(req["body"]).length > 0) {
        console.log(`       ${JSON.stringify(req["body"])}`);
    }
    next();
});

// 6. Controllo degli accessi tramite CORS
// Procedura che lascia passare tutto, accetta tutte le richieste
/* const cors = require('cors');

app.use(cors()); */

const corsOptions = {
    origin: null,
    credentials: true
};
app.use("/", _cors(corsOptions));
/* 
const whitelist = [
    "http://cerratodiego-crud-server.onrender.com",	// porta 80 (default)
    "https://cerratodiego-crud-server.onrender.com",	// porta 443 (default)
    "https://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4200" // server angular
]; */
// Procedura che utilizza la whitelist, accetta solo le richieste presenti nella whitelist
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (!origin) // browser direct call
//             return callback(null, true);
//         if (whitelist.indexOf(origin) === -1) {
//             var msg = `The CORS policy for this site does not allow access from the specified Origin.`
//             return callback(new Error(msg), false);
//         }
//         else
//             return callback(null, true);
//     },
//     credentials: true
// };
// app.use("/", _cors(corsOptions));

// 7. Configurazione di nodemailer
const auth = {
    "user": process.env.gmailUser,
    "pass": process.env.gmailPassword,
}
/* const transporter = _nodemailer.createTransport({
    "service": "gmail",
    "auth": auth
}); */
// let message = _fs.readFileSync("./message.html", "utf8");

//********************************************************************************************//
// Routes finali di risposta al client
//********************************************************************************************//

// La .send() mette status 200 e fa il parsing. In caso di codice diverso da 200 la .send() non fa il parsing
// I parametri GET in Express sono restituiti in req["query"]
// I parametri POST, PATCH, PUT, DELETE in Express sono restituiti in req["body"]
// Se nella url ho /api/:parametro il valore del parametro passato lo troverò in req["params"].parametro
// Se uso un input:files il contenuto dei files li troverò in req["files"].nomeParametro
// nomeParametro contiene due campi principali: 
// nomeParametro.name contiene il nome del file scelto dal client
// nomeParametro.data contiene il contenuto binario del file
// _streamifier serve solo per aggiungere immagine binarie su Cloudinary

app.get("/api/getGiocatori", async (req, res, next) => {
    const client = new MongoClient(connectionString)
    await client.connect()
    let db = client.db(DBNAME).collection("players")
    let request = db.find().toArray()
    request.then((data) => {
        res.status(200).send(data)
    })
    request.catch((err) => {
        res.status(500).send("Errore esecuzione query: " + err)
    })
    request.finally(() => {
        client.close()
    })
});

app.get("/api/getEventi", async (req, res, next) => {
    const client = new MongoClient(connectionString)
    await client.connect()
    let db = client.db(DBNAME).collection("events")
    let request = db.find().toArray()
    request.then((data) => {
        res.status(200).send(data)
    })
    request.catch((err) => {
        res.status(500).send("Errore esecuzione query: " + err)
    })
    request.finally(() => {
        client.close()
    })
});

app.post("/api/", async (req, res, next) => { });

app.patch("/api/", async (req, res, next) => { });

app.put("/api/", async (req, res, next) => { });

app.delete("/api/", async (req, res, next) => { });

//********************************************************************************************//
// Default route e gestione degli errori
//********************************************************************************************//

app.use("/", (req, res, next) => {
    res.status(404);
    if (req.originalUrl.startsWith("/api/")) {
        res.send(`Api non disponibile`);
    }
    else {
        res.send(paginaErrore);
    }
});

app.use("/", (err, req, res, next) => {
    console.log("************* SERVER ERROR ***************\n", err.stack);
    res.status(500).send(err.message);
});