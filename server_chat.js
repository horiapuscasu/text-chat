const express = require('express');
var Ddos = require('ddos');
var ddos = new Ddos({
    burst: 10,
    limit: 15
}); //new Ddos;
var app = express();
var cors = require('cors');
const https = require("https");
//const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const uuid = require('uuid');
const currentPrivateChat = [];
const port = process.env.PORT || 3129;
var CryptoJS = require("crypto-js");
const {
    ConnectQOS
} = require("connect-qos");
var cookie = require('cookie');
var formidable = require('formidable');
var mime = require('mime-types');
var auth = require("http-auth");
const authConnect = require("http-auth-connect");
privateKey = fs.readFileSync(__dirname + "/ssl/server.key", "utf8");
certificate = fs.readFileSync(__dirname + "/ssl/server.crt", "utf8");
const credentials = {
    key: privateKey,
    cert: certificate
};
var cluster = require("cluster"); //Require the cluster module
const punycode = require('node:punycode');
process.on('uncaughtException', function(err) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
});
var workers = new Array(); //Array of worker threads

if (cluster.isMaster) {
    var cpus = require("os").cpus().length; //Number of cores on this host
    for (var i = 0; i < cpus; i++) {
        var thread = cluster.fork(); //Fork

        thread.on("message", function(message) { //On an IPC message
            workers.forEach(function(worker) { //Loop through the workers
                if (worker.process.pid != message.pid) { //If the worker is not the sender
                    worker.send(message.msg); //Send the message
                }
            });
        });
        workers.push(thread); //Add the thread to the array of workers
    }
    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        for (var key in workers) {
            if (workers[key] == worker) {
                workers.splice(key, 1);
            }
        }
        var thread = cluster.fork(); //Fork
        workers.push(thread);
    });
    return; //Prevent the master thread from executing past this point
}
var my_line = '';
const allFileContents = fs.readFileSync(path.resolve(__dirname, 'password.txt'), 'utf-8');
allFileContents.split(/\r?\n/).forEach(line => {
    if (line.indexOf('password=') >= 0) {
        my_line = line;
    }
});
var arr_sess = my_line.split("password=");
pass_enc = arr_sess[1];
// Create a static server to serve client files
const LimitingMiddleware = require('limiting-middleware');
const tls = require('node:tls');
app.use(
    cors({
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    })
);
//app.use(new LimitingMiddleware({ limit: 60, resetInterval: 1200000 }).limitByIp());
//app.use(ddos.express);
//app.use(new ConnectQOS().getMiddleware());
var digest = auth.digest({
    realm: '/',
    file: __dirname + "/pass1"
});
app.use(authConnect(digest));
app.get('/', function(req, res) {
    fs.readFile('./index.html', 'UTF-8', (err, html) => {
        res.setHeader('Server', 'Apache');
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end(html);
    });
});
app.post(/upload/, function(req, res) {
    const cookies = parseCookies(req);
    res.setHeader('Server', 'Apache');
    console.log(cookies);
    if (cookies['fm'] != null) {

        cookies['fm'] = cookies['fm'].indexOf('%') >= 0 ? decodeURIComponent(cookies['fm']) : cookies['fm'];
        try {
            message = CryptoJS.AES.decrypt(cookies['fm'], pass_enc).toString(CryptoJS.enc.Utf8);
        } catch (e) {
            message = false;
        }
        if (message) {
            var form = new formidable.IncomingForm();
            form.maxFileSize = 30 * 1024 * 1024;
            form.parse(req, function(err, fields, files) {
                //console.log(files);
                var oldpath = files.fileupload[0].filepath; //.replace(/\\/g,'/');
                var newpath = __dirname + '/files/' + files.fileupload[0].originalFilename;
                fs.rename(oldpath, newpath, function(err) {
                    if (err) throw err;
                    //res.write('File uploaded and moved!');
                    res.end();
                });
            });
        }
    }
});
app.get(/files/, function(req, res) {
    res.setHeader('Server', 'Apache');
    const cssStream = fs.createReadStream(path.join(__dirname, decodeURIComponent(req.url)), 'UTF-8');
    res.writeHead(200, {
        "Content-Type": mime.contentType(path.extname(path.join(__dirname, req.url)))
    });
    cssStream.pipe(res);
});
app.get(/.css$/, function(req, res) {
    res.setHeader('Server', 'Apache');
    const cssStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
    res.writeHead(200, {
        "Content-Type": "text/css"
    });
    cssStream.pipe(res);
});
app.get(/.js$/, function(req, res) {
    res.setHeader('Server', 'Apache');
    const jsStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
    res.writeHead(200, {
        "Content-Type": "application/javascript"
    });
    jsStream.pipe(res);
});
var favicon = new Buffer('AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREQAAAAAAEAAAEAAAAAEAAAABAAAAEAAAAAAQAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD8HwAA++8AAPf3AADv+wAA7/sAAP//AAD//wAA+98AAP//AAD//wAA//8AAP//AAD//wAA', 'base64');
app.get("/favicon.ico", function(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Length', favicon.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader("Cache-Control", "public, max-age=2592000"); // expiers after a month
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    res.end(favicon);
});
var digest = auth.digest({
    realm: '/',
    file: __dirname + "/pass1"
});
app.use(authConnect(digest));
app.use((err, req, res, next) => {
    if (err) {
        return res.sendStatus(500);
    }
    next();
});
/*const server =  http2.createSecureServer(credentials, app).listen(port, () => {
	console.log(`Worker ${process.pid} listening on port ${port}`);
});*/
const server = https.createServer(credentials, app).listen(port, () => {
    console.log(`Worker ${process.pid} listening on port ${port}`);
});

const wss = new WebSocket.Server({
    maxPayload: 3 * 1024,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    },
    server: server
});

// TODO: send to client only if there is any change.
setInterval(updateOnlineUsers, 3000);

wss.on('connection', (ws, req) => {
    const currentTime = Date.now();
    ws.upgradeReq = req;
    var cookies = cookie.parse(ws.upgradeReq.headers.cookie);
    //console.log(cookies);
    if (cookies['fm'] != null) {

        cookies['fm'] = cookies['fm'].indexOf('%') >= 0 ? decodeURIComponent(cookies['fm']) : cookies['fm'];
        try {
            message = CryptoJS.AES.decrypt(cookies['fm'], pass_enc).toString(CryptoJS.enc.Utf8);
        } catch (e) {
            message = false;
        }
        if (!testJSON(message)) {
            wss.clients.forEach((ws1) => {
                if (ws == ws1) {
                    wss.clients.delete(ws1);
                    ws = null;
                    return true;
                }
            });
        }
    } else {
        wss.clients.forEach((ws1) => {
            if (ws == ws1) {
                wss.clients.delete(ws1);
                ws = null;
                return true;
            }
        });
    }
    if (!ws) {
        return;
    }
    // Unique id is assigned, set username to Anonymous and set login time
    // to each client after the connection is made.
    Object.assign(ws, {
        id: uuid.v4(),
        username: 'Anonymous',
        date: currentTime
    });

    // Send the event back to client so it can display a new user is added.
    var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify({
        type: 'new_user',
        text: 'Anonymous',
        id: ws.id,
        date: currentTime,
        usersp: JSON.stringify(["all-all"])
    })), pass_enc).toString();

    ws.send(msg);
    // Also send a broadcast message so other users can get notified.
    broadCastThis({
        type: 'public_msg',
        text: 'Someone just joined!',
        from: null,
        date: currentTime
    });

    ws.on('message', message => {
        var msg = message.toString('utf8');
        try {
            message = CryptoJS.AES.decrypt(msg, pass_enc).toString(CryptoJS.enc.Utf8);
        } catch (e) {
            message = false;
        }
        if (!testJSON(message)) {
            wss.clients.forEach((ws1) => {
                if (ws == ws1) {
                    wss.clients.delete(ws1);
                    ws = null;
                    return true;
                }
            });
        }
        if (!message) {
            return;
        }
        let messageParsed = JSON.parse(punycode.toUnicode(message));
        //console.log(messageParsed);

        if (messageParsed.type === 'private_msg') {
            //console.log(messageParsed);
            // Get fromClient and toClient.
            /*var x = messageParsed.usersp;
            	var c = x.indexOf('[') ; 
            	var L = x.indexOf(']') ;
            	var final = x.slice (c,L+1) ;
            	//console.log(final);
            var arr_ids = JSON.parse(final);*/
            //console.log(punycode.toUnicode((messageParsed.usersp));
            var arr_ids = JSON.parse(messageParsed.usersp);
            var strIds = messageParsed.usersp;
            fromClient = findClientById(ws.id);
            toClient = findClientById(arr_ids[1]);
            messageParsed.usersp = JSON.stringify([ws.id, ws.id == arr_ids[1] ? arr_ids[0] : arr_ids[1]]);
            //delete messageParsed.withId;

            /*if (typeof toClient === 'undefined' ||
            	toClient.readyState !== WebSocket.OPEN ||
            	typeof fromClient === 'undefined' ||
            	fromClient.readyState !== WebSocket.OPEN
            	) {
            	return;
            }*/

            // Send private chat message to toClient.


            Object.assign(messageParsed, {
                with: {
                    id: ws.id,
                    username: ws.username,
                    self: false
                }
            });
            var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify(messageParsed)), pass_enc).toString();
            if (Object.prototype.toString.call(toClient) === '[object Object]') {
                toClient.send(msg);

            }
            process.send({
                pid: process.pid,
                msg: msg
            });
            //process.send( {pid: process.pid, msg: msg} );
            // Send private chat message to fromClient.


            Object.assign(messageParsed, {
                with: {
                    id: ws.id == arr_ids[1] ? arr_ids[0] : arr_ids[1],
                    username: messageParsed.username,
                    self: true
                }
            });
            var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify(messageParsed)), pass_enc).toString();
            if (Object.prototype.toString.call(fromClient) === '[object Object]') {
                fromClient.send(msg);
            }

        }
        // Public msg should be broadcasted.
        else if (messageParsed.type === 'public_msg') {
            Object.assign(messageParsed, {
                from: {
                    id: ws.id,
                    username: ws.username
                }
            });
            messageParsed.usersp = JSON.stringify(["all-all"]);
            broadCastThis(messageParsed);
        } else if (messageParsed.type === 'username') {
            // Update username for the client.
            ws.username = messageParsed.text + "(" + (ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.socket.remoteAddress) + ")" + ' PID:' + process.pid;
        } else if (messageParsed.type === 'pong') {
            // Update username for the client.
            ws.pong = true;
        } else if (messageParsed.type === 'connect_private_chat' && false) {
            connectToClient(ws.id, messageParsed.text);
        }
    });
    ws.on("close", function() {
        wss.clients.forEach((ws1) => {
            if (ws == ws1) {
                wss.clients.delete(ws1);
                return true;
            }
        });
        updateOnlineUsers();
    });
    ws.on("error", function() {
        wss.clients.forEach((ws1) => {
            if (ws == ws1) {
                wss.clients.delete(ws1);
                return true;
            }
        });
        updateOnlineUsers();
    });
});

// Broadcast this message by sending it to all the clients.
function broadCastThis(message) {
    var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify(message)), pass_enc).toString();
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {

            client.send(msg);
        }
    });
    process.send({
        pid: process.pid,
        msg: msg
    });
}

function findClientById(id) {
    let clientFound = 0;
    wss.clients.forEach(client => {
        if (client.id === id && client.readyState === WebSocket.OPEN) {
            clientFound = client;
        }
    });

    return clientFound;
}

// Update online users list, specially if someone closed the chat window.
function updateOnlineUsers() {
    const message = {
        type: 'onlineusers',
        users: []
    };
    wss.clients.forEach(client => {
        if (client.pong == false) {
            wss.clients.delete(client);
        }
    });
    // Create a list of all users.
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            message.users.push({
                id: client.id,
                text: client.username,
                date: client.date
            });
        } else {
            wss.clients.delete(client);
        }
    });
    message.usersp = JSON.stringify(["all-all"]);
    var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify(message)), pass_enc).toString();

    // Send the list to all users.
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {

            client.send(msg);
            client.pong = false;
        }
    });
    process.send({
        pid: process.pid,
        msg: msg
    });
}

function connectToClient(fromId, toId) {
    /*var x = toId;
    	var c = x.indexOf('[') ; 
    	var L = x.indexOf(']') ;
    	var final = x.slice (c,L+1) ;
    	//console.log(final);
    var arr_ids = JSON.parse(final);*/
    //console.log(punycode.decode(toId.toString('utf8')));
    var arr_ids = JSON.parse(toId);
    var strIds = toId;
    toId = arr_ids[1];
    let fromClient, toClient;

    // Get fromClient and toClient.
    fromClient = findClientById(arr_ids[0]);
    toClient = findClientById(arr_ids[1]);

    if (false && fromClient.readyState !== WebSocket.OPEN && toClient.readyState !== WebSocket.OPEN) {
        console.log('Private chat failed as both clients left.');
    } else if (false && fromClient.readyState === WebSocket.OPEN && toClient.readyState !== WebSocket.OPEN) {
        var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify({
            type: 'start_private_chat_failed'
        })), pass_enc).toString();
        if (fromClient) {
            fromClient.send(msg);
            process.send({
                pid: process.pid,
                msg: msg
            });
        }
    }
    //else if (fromClient.readyState === WebSocket.OPEN && toClient.readyState === WebSocket.OPEN) {
    else if (false && Object.prototype.toString.call(toClient) === '[object Object]' || Object.prototype.toString.call(fromClient) === '[object Object]') {
        // Send private chat initiate message to toClient.
        let message = {
            type: 'start_private_chat',
            with: {
                id: fromId,
                username: fromClient ? fromClient.username : ""
            },
            users: strIds
        };
        var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify(message)), pass_enc).toString();
        if (Object.prototype.toString.call(toClient) === '[object Object]') {
            toClient.send(msg);
            process.send({
                pid: process.pid,
                msg: msg
            });
        }
        // Send private chat initiate message to fromClient.
        message = {
            type: 'start_private_chat',
            with: {
                id: toId,
                username: toClient ? toClient.username : ""
            },
            users: strIds
        };
        var msg = CryptoJS.AES.encrypt(punycode.toASCII(JSON.stringify(message)), pass_enc).toString();
        if (Object.prototype.toString.call(fromClient) === '[object Object]') {
            fromClient.send(msg);

        }
        process.send({
            pid: process.pid,
            msg: msg
        });
        currentPrivateChat.push({
            user1Id: fromId,
            user2Id: toId
        });
    }
}

function testJSON(text) {
    if (Object.prototype.toString.call(text) !== "[object String]") {
        return false;
    }
    try {
        JSON.parse(text);
        return true;
    } catch (error) {
        return false;
    }
}

function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}
process.on("message", function(message) { //On an IPC message
    var om = message;
    var msg = message.toString('utf8');
    try {
        message = CryptoJS.AES.decrypt(msg, pass_enc).toString(CryptoJS.enc.Utf8);
    } catch (e) {
        message = false;
    }
    if (message) {
        message = JSON.parse(punycode.toUnicode(message).toString());
        wss.clients.forEach((ws) => {
            //ws.emit('message',message);
            //ws.onmessage(message);
            //console.log(message);
            if (message.usersp && (message.usersp.indexOf("all-all") >= 0 || message.usersp.indexOf(ws.id) >= 0)) {
                ws.send(om); //Send the message
            }
        });
    }
});