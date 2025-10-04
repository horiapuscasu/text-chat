const express = require('express');
var Ddos = require('ddos');
var ddos = new Ddos({burst:10, limit:15});//new Ddos;
var app = express();
var cors = require('cors');
const https = require("https");
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const uuid = require('uuid');
const currentPrivateChat = [];
const port = process.env.PORT || 3129;
var CryptoJS = require("crypto-js");
const { ConnectQOS } = require("connect-qos");
var cookie = require('cookie');
var formidable = require('formidable');
var mime = require('mime-types');
var auth = require("http-auth");
const authConnect = require("http-auth-connect");
privateKey = fs.readFileSync(__dirname+"/ssl/server.key", "utf8");
certificate = fs.readFileSync(__dirname+"/ssl/server.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };
process.on('uncaughtException', function (err) 
	{
		console.error('An uncaught error occurred!');
		console.error(err.stack);
	});
	var my_line = '';
    const allFileContents = fs.readFileSync(path.resolve(__dirname,'password.txt'), 'utf-8');
    allFileContents.split(/\r?\n/).forEach(line => 
		{
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
			file: __dirname+"/pass1"
		});
		app.use(authConnect(digest));
		app.get('/',function(req, res) {
			fs.readFile('./index.html', 'UTF-8', (err, html) => {
				res.setHeader('Server', 'Apache'); 
				res.writeHead(200, {"Content-Type": "text/html"});
				res.end(html);
			});
		});
		app.post(/upload/,function(req, res) {
			const cookies = parseCookies(req);
			res.setHeader('Server', 'Apache');
			console.log(cookies);
			if(cookies['fm'] != null){
				
				cookies['fm'] = cookies['fm'].indexOf('%') >= 0 ? decodeURIComponent(cookies['fm']) : cookies['fm'];
				try{
					message = CryptoJS.AES.decrypt(cookies['fm'],pass_enc).toString(CryptoJS.enc.Utf8);
				}
				catch(e){
					message = false;
				}
				if(message){
					var form = new formidable.IncomingForm();
					form.maxFileSize = 30 * 1024 * 1024;
					form.parse(req, function (err, fields, files) {
						//console.log(files);
						var oldpath = files.fileupload[0].filepath;//.replace(/\\/g,'/');
						var newpath = __dirname+'/files/' + files.fileupload[0].originalFilename;
						fs.rename(oldpath, newpath, function (err) {
							if (err) throw err;
							//res.write('File uploaded and moved!');
							res.end();
						});
					});
				}
			}
		});
		app.get(/files/,function(req, res) {
			res.setHeader('Server', 'Apache');
			const cssStream = fs.createReadStream(path.join(__dirname, decodeURIComponent(req.url)), 'UTF-8');
			res.writeHead(200, {"Content-Type": mime.contentType(path.extname(path.join(__dirname, req.url)))});
			cssStream.pipe(res);
		});
		app.get(/.css$/, function (req, res) {
			res.setHeader('Server', 'Apache');
			const cssStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
			res.writeHead(200, {"Content-Type": "text/css"});
			cssStream.pipe(res);
		});
		app.get(/.js$/, function (req, res) {
			res.setHeader('Server', 'Apache');
			const jsStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
			res.writeHead(200, {"Content-Type": "application/javascript"});
			jsStream.pipe(res);
		});
		var favicon = new Buffer('AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREQAAAAAAEAAAEAAAAAEAAAABAAAAEAAAAAAQAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD8HwAA++8AAPf3AADv+wAA7/sAAP//AAD//wAA+98AAP//AAD//wAA//8AAP//AAD//wAA', 'base64'); 
		app.get("/favicon.ico", function(req, res) {
			res.statusCode = 200;
			res.setHeader('Content-Length', favicon.length);
			res.setHeader('Content-Type', 'image/x-icon');
			res.setHeader("Cache-Control", "public, max-age=2592000");                // expiers after a month
			res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
			res.end(favicon);
		});
		var digest = auth.digest({
			realm: '/',
			file: __dirname+"/pass1"
		});
		app.use(authConnect(digest));
		app.use((err, req, res, next) => {
			if (err) {
				return res.sendStatus(500);
			}
			next();
		});
		const server = https.createServer(credentials,app).listen(port);
		
		const wss = new WebSocket.Server({
			maxPayload : 3 * 1024,
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
			server : server 
		});
		
		// TODO: send to client only if there is any change.
		setInterval(updateOnlineUsers, 3000);
		
		wss.on('connection', (ws, req) => {
			const currentTime = Date.now();
			ws.upgradeReq = req;
			var cookies=cookie.parse(ws.upgradeReq.headers.cookie);
			//console.log(cookies);
			if(cookies['fm'] != null){
				
				cookies['fm'] = cookies['fm'].indexOf('%') >= 0 ? decodeURIComponent(cookies['fm']) : cookies['fm'];
				try{
					message = CryptoJS.AES.decrypt(cookies['fm'],pass_enc).toString(CryptoJS.enc.Utf8);
				}
				catch(e){
					message = false;
				}
				if(!testJSON(message)){
					wss.clients.forEach((ws1) => {
						if (ws == ws1) {
							wss.clients.delete(ws1);
							ws=null;
							return true;
						}
					});
				}
			}
			else{
				wss.clients.forEach((ws1) => {
					if (ws == ws1) {
						wss.clients.delete(ws1);
						ws=null;
						return true;
					}
				});
			}
			if(!ws){
				return;
			}
			// Unique id is assigned, set username to Anonymous and set login time
			// to each client after the connection is made.
			Object.assign(ws, {id: uuid.v4(), username: 'Anonymous', date: currentTime});
			
			// Send the event back to client so it can display a new user is added.
			ws.send(CryptoJS.AES.encrypt(JSON.stringify({type:'new_user', text: 'Anonymous', id: ws.id, date: currentTime}), pass_enc).toString());
			
			// Also send a broadcast message so other users can get notified.
			broadCastThis({type:'public_msg', text: 'Someone just joined!', from: null, date: currentTime});
			
			ws.on('message', message => {
				var msg = message.toString('utf8');
				try{
					message = CryptoJS.AES.decrypt(msg,pass_enc).toString(CryptoJS.enc.Utf8);
				}
				catch(e){
					message = false;
				}
				if(!testJSON(message)){
					wss.clients.forEach((ws1) => {
						if (ws == ws1) {
							wss.clients.delete(ws1);
							ws=null;
							return true;
						}
					});
				}
				if(!message){
					return;
				}
				let messageParsed = JSON.parse(message);
				//console.log(messageParsed);
				
				if (messageParsed.type === 'private_msg') {
					// Get fromClient and toClient.
					fromClient = findClientById(ws.id);
					toClient = findClientById(messageParsed.withId);
					delete messageParsed.withId;
					
					if (typeof toClient === 'undefined' ||
						toClient.readyState !== WebSocket.OPEN ||
						typeof fromClient === 'undefined' ||
						fromClient.readyState !== WebSocket.OPEN
						) {
						return;
					}
					
					// Send private chat message to toClient.
					Object.assign(messageParsed, {with: {id: fromClient.id, username: fromClient.username, self: false}});
					toClient.send(CryptoJS.AES.encrypt(JSON.stringify(messageParsed), pass_enc).toString());
					
					// Send private chat message to fromClient.
					Object.assign(messageParsed, {with: {id: toClient.id, username: 'You', self: true}});
					fromClient.send(CryptoJS.AES.encrypt(JSON.stringify(messageParsed), pass_enc).toString());
				}
				// Public msg should be broadcasted.
				else if(messageParsed.type === 'public_msg') {
					Object.assign(messageParsed, {from: {id: ws.id, username: ws.username}});
					broadCastThis(messageParsed);
				}
				else if(messageParsed.type === 'username') {
					// Update username for the client.
					ws.username = messageParsed.text+"("+(ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.socket.remoteAddress)+")";
				}
				else if(messageParsed.type === 'pong') {
					// Update username for the client.
					ws.pong = true;
				}
				else if(messageParsed.type === 'connect_private_chat') {
					connectToClient(ws.id, messageParsed.text);
				}
			});
			ws.on("close", function(){
				wss.clients.forEach((ws1) => {
					if (ws == ws1) {
						wss.clients.delete(ws1);
						return true;
					}
				});
				updateOnlineUsers();
			});
			ws.on("error", function(){
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
			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(CryptoJS.AES.encrypt(JSON.stringify(message), pass_enc).toString());
				}
			});
		}
		
		function findClientById(id) {
			let clientFound;
			wss.clients.forEach(client => {
				if (client.id === id && client.readyState === WebSocket.OPEN) {
					clientFound = client;
				}
			});
			
			return clientFound;
		}
		
		// Update online users list, specially if someone closed the chat window.
		function updateOnlineUsers() {
			const message = {type: 'onlineusers', users: []};
			wss.clients.forEach(client => {
				if (client.pong==false) {
					wss.clients.delete(client);
				}
			});
			// Create a list of all users.
			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					message.users.push({id: client.id, text: client.username, date: client.date});
				}
				else{
					wss.clients.delete(client);
				}
			});
			
			// Send the list to all users.
			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(CryptoJS.AES.encrypt(JSON.stringify(message), pass_enc).toString());
					client.pong=false;
				}
			});
		}
		function connectToClient(fromId, toId) {
			let fromClient, toClient;
			
			// Get fromClient and toClient.
			fromClient = findClientById(fromId);
			toClient = findClientById(toId);
			
			if (fromClient.readyState !== WebSocket.OPEN && toClient.readyState !== WebSocket.OPEN) {
				console.log('Private chat failed as both clients left.');
			}
			else if (fromClient.readyState === WebSocket.OPEN && toClient.readyState !== WebSocket.OPEN) {
				fromClient.send(CryptoJS.AES.encrypt(JSON.stringify({type: 'start_private_chat_failed'}), pass_enc).toString());
			}
			else if (fromClient.readyState === WebSocket.OPEN && toClient.readyState === WebSocket.OPEN) {
				// Send private chat initiate message to toClient.
				let message = {type: 'start_private_chat', with: {id: fromClient.id, username: fromClient.username}};
				toClient.send(CryptoJS.AES.encrypt(JSON.stringify(message), pass_enc).toString());
				
				// Send private chat initiate message to fromClient.
				message = {type: 'start_private_chat', with: {id: toClient.id, username: toClient.username}};
				fromClient.send(CryptoJS.AES.encrypt(JSON.stringify(message), pass_enc).toString());
				
				currentPrivateChat.push({user1Id: fromClient.id, user2Id: toClient.id});
			}
		}
		function testJSON(text)
		{
			if (typeof text !== "string") {
				return false;
			}
			try {
				JSON.parse(text);
				return true;
			}
			catch (error) {
				return false;
			}
		}
		function parseCookies (request) {
			const list = {};
			const cookieHeader = request.headers?.cookie;
			if (!cookieHeader) return list;
			
			cookieHeader.split(`;`).forEach(function(cookie) {
				let [ name, ...rest] = cookie.split(`=`);
				name = name?.trim();
				if (!name) return;
				const value = rest.join(`=`).trim();
				if (!value) return;
				list[name] = decodeURIComponent(value);
			});
			
			return list;
		}
				