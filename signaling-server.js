

/**************/
/*** CONFIG ***/
/**************/
const PORT = 8081;


/*************/
/*** SETUP ***/
/*************/
require('ejs');
const fs = require("fs");
const express = require('express');
//var http = require('http');
const https = require("https");
const bodyParser = require('body-parser')
const app = express();
const path = require('path');
var auth = require("http-auth");
const authConnect = require("http-auth-connect");
var cors = require('cors');
var Ddos = require('ddos');
var ddos = new Ddos({burst:10, limit:15});//new Ddos;
const { ConnectQOS } = require("connect-qos");
var CryptoJS = require("crypto-js");
var cookie = require('cookie');
var formidable = require('formidable');
var mime = require('mime-types');
//var expressWs = require('express-ws')(app);
//console.log = function() {};
//const server = http.createServer(app)
process.on('uncaughtException', function (err) 
	{
		//console.error('An uncaught error occurred!');
		//console.error(err.stack);
	});
	/*
		setInterval(function(){
		throw(new Error('Test eror!!'));
		},5000);
	*/
	var my_line = '';
	const allFileContents = fs.readFileSync(path.resolve(__dirname,'passwords.json'), 'utf-8');
	var results = JSON.parse(allFileContents);
	function authentication(req, res, next) {
		const authheader = req.headers.authorization;
		//console.log(req.headers);
		
		if (!authheader) {
			let err = new Error('You are not authenticated!');
			res.setHeader('WWW-Authenticate', 'Basic');
			err.status = 401;
			return next(err)
		}
		
		const auth = new Buffer.from(authheader.split(' ')[1],
		'base64').toString().split(':');
		const user = auth[0];
		const pass = auth[1];
		
		if (user == 'admin' && pass == 'password') {
			
			// If Authorized user
			next();
			} else {
			let err = new Error('You are not authenticated!');
			res.setHeader('WWW-Authenticate', 'Basic');
			err.status = 401;
			return next(err);
		}
		
	}
	
	// First step is the authentication of the client
	//app.use(authentication);
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
	
	var digest = auth.digest({
		realm: '/',
		file: __dirname+"/pass1"
	});
	app.use(
		cors({
			origin: "*",
			methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
		})
	);
	app.post(/upload/,function(req, res) {
		const cookies = parseCookies(req);
		res.setHeader('Server', 'Apache');
		console.log(cookies);
		if(cookies['fm'] != null){
			var room = parseInt(cookies['room']);
			//cookies['fm'] = cookies['fm_'+iduser];
			cookies['fm'] = cookies['fm'].indexOf('%') >= 0 ? decodeURIComponent(cookies['fm']) : cookies['fm'];
			//pass_enc = results[parseInt(cookies['fm'])].password;
			var pass_enc = results[room].password; 
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
	/*
		const LimitingMiddleware = require('limiting-middleware');
		const tls = require('node:tls');
		app.use(new LimitingMiddleware({ limit: 60, resetInterval: 1200000 }).limitByIp());
	*/
	
	//app.use(ddos.express);
	//app.use(new ConnectQOS().getMiddleware());
	app.use((err, req, res, next) => {
		res.set('Cache-Control', 'no-store');
		if (err) {
			return res.sendStatus(500);
		}
		next();
	});
	const nocache = require('nocache');
	app.use(nocache());
	app.use(authConnect(digest));
	
	
	
	let privateKey, certificate;
	//c:\apache\bin\openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US/ST=New York/L=New York/O=none/CN=localhost" -keyout server.key -out server.crt
	privateKey = fs.readFileSync(__dirname+"/ssl/server.key", "utf8");
	certificate = fs.readFileSync(__dirname+"/ssl/server.crt", "utf8");
	const credentials = { key: privateKey, cert: certificate };
	const server = https.createServer(credentials, app);
	
	const io  = require('socket.io')(server,{
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
			allowedHeaders: ["my-custom-header"],
			credentials: true
		},
		transports: ['websocket'],
		allowEIO3: true,
		/*perMessageDeflate: {
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
		},*/ 
	});
	//io.set('log level', 2);
	
	server.listen(PORT, '0.0.0.0', function() {
		//console.log("Listening on port " + PORT);
	});
	//app.use(express.bodyParser());
	/*
		app.get(/.js$/, function (req, res) {
		res.setHeader('Server', 'Apache');
		const jsStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
		res.writeHead(200, {"Content-Type": "application/javascript"});
		jsStream.pipe(res);
		});
		app.get(/.css$/, function (req, res) {
		res.setHeader('Server', 'Apache');
		const jsStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
		res.writeHead(200, {"Content-Type": "text/css"});
		jsStream.pipe(res);
		});
	*/
	/*
		app.use(express.static(__dirname, {
		extensions: ['js','css']
		}));
	*/
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
	/*
		app.get(/.php$/, function (req, res) {
		var document1 = req.url.split('?')[0];
		var script1 = path.join(DocRoot, document1 || req.url);
		if(script1.indexOf('.php')==-1 && fs1.existsSync(script1+'.php')){
		req.url = req.url.replace(document1,document1+'.php');
		}
		if (req.url.match(/\.php(\?.*)?$/)) {
		php(req, res);
		} else {
		serve(req, res, finalhandler(req, res));
		}
		});
	*/
	//app.get('/', digest.check(async function(req, res){ res.sendFile(__dirname + '/client.html'); }));
	app.set('view engine', 'ejs');
	app.use(bodyParser.urlencoded({ extended: false }));
	app.get('/', function(req, res){res.render(__dirname + '/client.ejs',{results}); });
	/*app.get(/socket.io$/,function(req, res){ 
		var socket = req.app.get("socket");
		var req = socket.request;
		if(!digest.isAuthenticated(req, function(){})){
		delete sockets[socket.id];
		//console.log('Sunt un idiot!');
		}
		});
	*/
	/*
		app.ws('/socket.io', function(ws, req) {
		ws.on('message', function(msg) {
		console.log('mesaj:'+msg);
		if(!digest.isAuthenticated(req, function(){})){
		ws = null;
		return;
		}
		});
		////console.log('socket', req.testing);
		});
	*/
	// app.get('/index.html', function(req, res){ res.sendfile('newclient.html'); });
	// app.get('/client.html', function(req, res){ res.sendfile('newclient.html'); });
	
	
	
	/*************************/
	/*** INTERESTING STUFF ***/
	/*************************/
	var channels = {};
	var sockets = {};
	var idws = {};
	
	/**
		* Users will connect to the signaling server, after which they'll issue a "join"
		* to join a particular channel. The signaling server keeps track of all sockets
		* who are in a channel, and on join will send out 'addPeer' events to each pair
		* of users in a channel. When clients receive the 'addPeer' even they'll begin
		* setting up an RTCPeerConnection with one another. During this process they'll
		* need to relay ICECandidate information to one another, as well as SessionDescription
		* information. After all of that happens, they'll finally be able to complete
		* the peer connection and will be streaming audio/video between eachother.
	*/
	/*
		io.use((socket, next) => {
		var req = socket.request;
		var res = req.res;
		digest.check(async function(req, res){
		next();
		}
		)
		
		});
	*/
	
	io.on('connection', (socket) => {
		console.log('Client connected');
		
		// Access the cookie sent in the handshake (after the initial HTTP request)
		//var req1 = {'headers':''};
		//req1.headers = socket.handshake.headers.cookie;
		const cookies = parseCookies(socket.handshake);
		console.log(cookies);
		if (cookies) {
			if(cookies['fm'] != null){
				
				cookies['fm'] = cookies['fm'].indexOf('%') >= 0 ? decodeURIComponent(cookies['fm']) : cookies['fm'];
				var sr = parseInt(cookies['room']);
				var pass_enc = results[sr].password;
				try{
					message = CryptoJS.AES.decrypt(cookies['fm'],pass_enc).toString(CryptoJS.enc.Utf8);
				}
				catch(e){
					message = false;
				}
				if(!testJSON(message)){
					//socket = null;
					socket.disconnect();
					return;
				}
				socket.room = sr;
			}
			else{
				socket.disconnect();
				return;
			}
		}
		else{
			socket.disconnect();
			return;
		}
	});
	io.sockets.on('connection', function (socket) {
		
		
		socket.channels = {};
		//console.log(socket);
		/*var req = {};
			req.headers = socket.handshake.headers;
			if(!digest.isAuthenticated(req, function(){})){
			socket = null;
			return;
		}*/
		sockets[socket.id] = socket;
		//app.set("socket", socket);
		
		//console.log("["+ socket.id + "] connection accepted");
		socket.on('disconnect', function () {
			for (var channel in socket.channels) {
				part(channel);
			}
			//console.log("["+ socket.id + "] disconnected");
			delete sockets[socket.id];
		});
		
		
		socket.on('join', function (config) {
			//console.log("["+ socket.id + "] join ", config);
			var channel = config.channel;
			var userdata = config.userdata;
			
			if (channel in socket.channels) {
				//console.log("["+ socket.id + "] ERROR: already joined ", channel);
				return;
			}
			
			if (!(channel in channels)) {
				channels[channel] = {};
			}
			
			for (id in channels[channel]) {
				channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
				socket.emit('news-response', config.userdata);
				socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true});
			}
			
			channels[socket.room][socket.id] = socket;
			socket.channels[socket.room] = socket.room;
		});
		
		function part(channel) {
			//console.log("["+ socket.id + "] part ");
			
			if (!(channel in socket.channels)) {
				//console.log("["+ socket.id + "] ERROR: not in ", channel);
				return;
			}
			
			delete socket.channels[channel];
			delete channels[channel][socket.id];
			
			for (id in channels[channel]) {
				channels[channel][id].emit('removePeer', {'peer_id': socket.id});
				socket.emit('removePeer', {'peer_id': id});
			}
		}
		socket.on('part', part);
		
		socket.on('relayICECandidate', function(config) {
			var peer_id = config.peer_id;
			var ice_candidate = config.ice_candidate;
			//console.log("["+ socket.id + "] relaying ICE candidate to [" + peer_id + "] ", ice_candidate);
			
			if (peer_id in sockets) {
				sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
			}
		});
		
		socket.on('relaySessionDescription', function(config) {
			var peer_id = config.peer_id;
			var session_description = config.session_description;
			//console.log("["+ socket.id + "] relaying session description to [" + peer_id + "] ", session_description);
			
			if (peer_id in sockets) {
				sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
			}
		});
		socket.on ('player move', function (msg) {
			io.sockets.emit ('updatePlayer', msg);
			/*if (peer_id in sockets) {
				sockets[peer_id].emit ('updatePlayer', msg);
			}*/
		});
	});
	
		