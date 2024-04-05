import _https from "https";
import _url from "url";
import _fs from "fs";
import _express from "express";
import _dotenv from "dotenv";
import _cors from "cors";
import _fileUpload from "express-fileupload";
// const _nodemailer = require("nodemailer");
import _jwt from "jsonwebtoken";
import _bcrypt from "bcryptjs"; // + @types
import { google } from "googleapis";
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
const ENCRYPTION_KEY = _fs.readFileSync("./keys/encryptionKey.txt", "utf8")
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

// 7. Configurazione di nodemailer con utilizzo di oAuth2
/* const o_Auth2 = JSON.parse(process.env.oAuthCredential as any)
const OAuth2 = google.auth.OAuth2; // Oggetto OAuth2
const OAuth2Client = new OAuth2(
    o_Auth2["client_id"],
    o_Auth2["client_secret"]
);
OAuth2Client.setCredentials({
    refresh_token: o_Auth2.refresh_token,
}); 

let message = _fs.readFileSync("./message.html", "utf8");*/

//8. login

app.post("/api/login", async (req, res, next) => {
    let username = req["body"]["username"]
    let password = req["body"]["password"]
    const client = new MongoClient(connectionString)
    await client.connect()
    const collection = client.db(DBNAME).collection("users")
    let regex = new RegExp("^" + username + "$", "i")
    let request = collection.findOne({ "email": regex }, { "projection": { "email": 1, "password": 1 } })
    request.then((dbUser) => {
        if (!dbUser) {
            res.status(401).send("Username not valid")
        }
        else {
            let token = creaToken(dbUser);
            console.log(token)
            res.setHeader("authorization", token)
            res.setHeader("access-control-expose-headers", "authorization")
            res.send({ "ris": "ok" })
        }
        /* else {
            _bcrypt.compare(password, dbUser.password, (err, success) => {
                if (err)
                    res.status(500).send("Bcrypt compare error " + err.message)
                else {
                    if (!success) {
                        res.status(401).send("Password not valid")
                    }
                    else {
                        let token = creaToken(dbUser);
                        console.log(token)
                        res.setHeader("authorization", token)
                        res.setHeader("access-control-expose-headers", "authorization")
                        res.send({ "ris": "ok" })
                    }
                }
            })
        } */
    })
    request.catch((err) => {
        res.status(500).send("Query fallita")
    })
    request.finally(() => {
        client.close()
    })
})

function creaToken(data) {
    let currentTime = Math.floor(new Date().getTime() / 1000)
    let payload = {
        "_id": data._id,
        "username": data.username,
        "iat": data.iat || currentTime,
        "exp": currentTime + parseInt(process.env.durata_token)
    }
    let token = _jwt.sign(payload, ENCRYPTION_KEY)
    return token
}

//9. controllo token Google
app.post("/api/googleLogin", async (req, res, next) => {
    if (!req.headers["authorization"]) {
        res.status(403).send("Token mancante")
    }
    else {
        let token = req.headers["authorization"]
        //ottengo payload del token con decodifica Base64
        let payload = _jwt.decode(token);
        let username = payload["email"]
        const client = new MongoClient(connectionString)
        await client.connect()
        const collection = client.db(DBNAME).collection("mails")
        let regex = new RegExp("^" + username + "$", "i")
        let request = collection.findOne({ "username": regex }, { "projection": { "username": 1 } })
        request.then((dbUser) => {
            if (!dbUser) {
                res.status(403).send("Username non autorizzato")
            }
            else {
                let token = creaToken(dbUser);
                //console.log(token)
                res.setHeader("authorization", token)
                res.setHeader("access-control-expose-headers", "authorization")
                res.send({ "ris": "ok" })
            }
        })
        request.catch((err) => {
            res.status(500).send("Query fallita")
        })
        request.finally(() => {
            client.close()
        })
    }
})

//10. controllo token
app.use("/api/", (req, res, next) => {
    if (!req["body"]["skipCheckToken"]) {
        if (!req.headers["authorization"]) {
            res.status(403).send("Token mancante")
        }
        else {
            let token = req["headers"]["authorization"]
            _jwt.verify(token, ENCRYPTION_KEY, (err, payload) => {
                if (err) {
                    res.status(403).send("Token corrotto " + err)
                }
                else {
                    let newToken = creaToken(payload)
                    console.log(newToken)
                    res.setHeader("authorization", newToken)
                    res.setHeader("access-control-expose-headers", "authorization")
                    req["payload"] = payload
                    next()
                }
            })
        }
    }
    else {
      
        next()
    }

})

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
    let db = client.db(DBNAME).collection("users")
    let request = db.find({ "categoria": "giocatore" }).toArray()
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

app.get("/api/getDatiPersonali", async (req, res, next) => {
    let mail = req["query"]["mail"]
    const client = new MongoClient(connectionString)
    await client.connect()
    let db = client.db(DBNAME).collection("users")
    let request = db.find({ "email": mail }).toArray()
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

/* app.post("/api/sendNewPassword", async (req, res, next) => {
    let username = "d.cerrato.2230@vallauri.edu"
    let password = "password"
    message = message.replace("__user", username).replace("__password", password)
    const accessToken = await OAuth2Client.getAccessToken().catch((err) => { res.status(500).send("Errore richiesta access token a google " + err) })
    console.log(accessToken)
    const auth = {
        "type": "OAuth2",
        "user": username, // process.env.email,
        "clientId": o_Auth2.client_id,
        "clientSecret": o_Auth2.client_secret,
        "refreshToken": o_Auth2.refresh_token,
        "accessToken": accessToken
    }
    const transporter = _nodemailer.createTransport({
        "service": "gmail",
        "auth": auth
    });
    let mailOptions = {
        "from": auth.user,
        "to": username,
        "subject": "nuova password di accesso a rilievi e perizie",
        "html": message,
        "attachments": [{
            "filename": "nuovaPassword.png",
            "path": "./qrCode.png"
        }]
    }
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            res.status(500).send("Errore invio mail\n" + err.message);
        }
        else {
            console.log("Email inviata correttamente");
            res.send({
                "ris": "OK",
                "info": info
            });
        }
    })

}) */

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