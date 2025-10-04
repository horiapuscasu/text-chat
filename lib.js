function randomIntFromInterval(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/*
	let chatSocket;
	let thisClientId;
	let chattingWith;
*/
document.getElementById('pass').value = localStorage.getItem(window.location.host+'_pass');
document.getElementById('name-text').value = localStorage.getItem(window.location.host+'_user2');
let chatuser=document.getElementById('name-text').value;
var pass_enc = document.getElementById('pass').value;
var arr_users_temp = [];
var chattingWithUsers = [];
function updateusers(){
	containerToWrite = document.getElementById("user-list");
	var msg={};
	let userListText = '', userJoinedAt;  
	
	arr_users_temp.map(user => {
		if(user.date){
			userJoinedAt = new Date(user.date).toLocaleTimeString();
			if (thisClientId === user.id) {
				userListText += `<b>User ${user.text}</b> (joined at ${userJoinedAt})<br />`;
			}
			else {
				userListText += `<b>User <a href="#" data-id="${user.id}"
				title="Chat with ${user.text}">${user.text}</a></b> (joined at ${userJoinedAt})<br />`;
			}
		}
	});
	containerToWrite.innerHTML = userListText;
	containerToWrite.scrollTop = containerToWrite.scrollHeight;
}
setTimeout(updateusers,10000);
setInterval(updateusers,30000);
/*setInterval(function(){
	arr_users_temp = [];
},300000);*/
var cntu =0;
function onlyUnique(value, index, array) {
	return array.indexOf(value) === index;
}
document.cookie = 'fm='+encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify({'text':randomIntFromInterval(1,1000000)}),pass_enc).toString());
var cnts=0;
function connect() {
	var reload = sessionStorage.getItem(window.location.host+'_reload');
	
	reload = reload?reload:0;
	if(reload){
		sessionStorage.removeItem(window.location.host+'_reload');
	}
	cnts++;
	if(cnts>200){
		sessionStorage.setItem(window.location.host+'_reload', 1);
		window.location.reload();
	}
	if (!window.location.hostname) {
		chatSocket = new WebSocket("ws://127.0.0.1:443");
	}
	else {
		chatSocket = new WebSocket(location.origin.replace(/^http/, 'ws'));
	}
	chatSocket.onopen = event => {
		// On chatsocket open, loop through all the input textbox
		// and make them enabled except for private chat.
		// Private chat will be enabled whenever someone click on you and vice-versa.
		let inputNodes = document.querySelectorAll('input[type="text"]');
		if (inputNodes.length) {
			inputNodes.forEach(elInput => {
				if (elInput.getAttribute('id') !== 'private-text') {
					elInput.removeAttribute("disabled");
				}
			});
		}
		sendMessage('username', document.getElementById('name-text').value);
		sendMessage('pong', '1');
	};
	
	// On receive message, render these on screen.
	chatSocket.onmessage = event => {
		
		
		
		try{
			var msg = CryptoJS.AES.decrypt(event.data, pass_enc).toString(CryptoJS.enc.Utf8);
		}
		catch(e){
			var msg = false;
			$(".hide1").addClass("hide");
		}
		if(testJSON(msg)){
			var msg = JSON.parse(msg);
			$(".hide1").removeClass("hide");
			writeMessage(msg);
		}
	};
	chatSocket.addEventListener("error", err => {
		var msg = {type: "public_msg",text: "Connection problems.", from: null};
		if(chattingWith){
			chattingWith.id = 0;
		}
		writeMessage(msg);
		console.error('Socket encountered error: ', err.message, 'Closing socket');
		chatSocket.close();
	});
	chatSocket.addEventListener("close" ,e => {
		console.log(e);
        console.log('Socket is closed. Reconnect will be attempted in 100 msecond.', e.reason);
        setTimeout(function() {
            connect();
		}, 100);
	});
}

function sendMessage(type, text) {
	text = utf8.encode(punycode.ToASCII(text));
	
	var msg = {
		type,
		text,
		date: Date.now()
	};
	
	if (type === 'private_msg') {
		msg.withId = chattingWith.id;
		msg.username = chattingWith.username;
		msg.users = JSON.stringify([thisClientId,chattingWith.id]);
	}
	
	// Send the msg object as a JSON-formatted string.
	chatSocket.send(CryptoJS.AES.encrypt(JSON.stringify(msg),pass_enc).toString());
}

/**
	* Renders the message received into browser.
	* 
	* @param {string} msg - the actual message object.
*/
function search(nameKey, myArray){
    for (let i=0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            return myArray[i];
        }
    }
}

function writeMessage(msg) {
	let text = "", timeStr = (msg.date?new Date(msg.date).toLocaleTimeString():new Date().toLocaleTimeString()), containerToWrite;
	
	switch(msg.type) {
		case "new_user":
		containerToWrite = document.getElementById("user-list");
		text = `<b>User ${msg.text}</b> (joined at ${timeStr})<br />`;
		thisClientId = msg.id;
		break;
		
		case "public_msg":
		var context = new (window.AudioContext || window.webkitAudioContext)();
		var osc = context.createOscillator(); // instantiate an oscillator
		osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
		osc.frequency.value = 440; // Hz
		osc.connect(context.destination); // connect it to the destination
		osc.start(); // start the oscillator
		context.resume();
		osc.stop(context.currentTime + 0.4); // stop 2 seconds after the current time
		containerToWrite = document.getElementById("public-chat");
		msg.text = punycode.ToUnicode(utf8.decode(msg.text));
		if (msg.from !== null) {
			text = `<b>${msg.from.username} - ${msg.text}</b> sent at ${timeStr}<br />`;
		}
		else {
			text = `<b>${msg.text}</b> at ${timeStr}<br />`;
		}
		break;
		
		case "onlineusers":
		cntu++;
		if(cntu%1000==0){
			arr_users_temp = [];
		}
		for(var i=0;i<msg.users.length;i++){
			if(msg.users[i].date){
				arr_users_temp.push(msg.users[i]);
			}
		}
		
		const key = 'id';
		
		arr_users_temp = [...new Map(arr_users_temp.map(item =>
		[item[key], item])).values()];
		//}	
		sendMessage('pong', '1');
		break;
		
		case "start_private_chat_failed":
		containerToWrite = document.getElementById("private-chat");
		containerToWrite.classList.add('error');
		containerToWrite.classList.remove('disabled');
		containerToWrite.innerHTML = 'User left. Private chat failed.';
		setTimeout(() => {
			containerToWrite.innerHTML = '';
			containerToWrite.classList.remove('error');
			containerToWrite.classList.add('disabled');
		}, 2000);
		break;
		
		case "start_private_chat":
		containerToWrite = document.getElementById("private-chat");
		containerToWrite.classList.remove('disabled');
		document.getElementById("private-text").removeAttribute("disabled");
		chattingWith = {id: msg.with.id, username: msg.with.username};
		chattingWithUsers = JSON.parse(msg.users);
		chattingWith.id = thisClientId != chattingWithUsers[0]?chattingWithUsers[1]:chattingWithUsers[0];
		var item = arr_users_temp.find(item => item.id === chattingWith.id);
		containerToWrite.innerHTML += `<div style="color:navy;">Chatting with - ${item.text}</div>`;
		break;
		
		case "private_msg":
		var context = new (window.AudioContext || window.webkitAudioContext)();
		var osc = context.createOscillator(); // instantiate an oscillator
		osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
		osc.frequency.value = 440; // Hz
		osc.connect(context.destination); // connect it to the destination
		osc.start(); // start the oscillator
		context.resume();
		osc.stop(context.currentTime + 0.4); // stop 2 seconds after the current time
		containerToWrite = document.getElementById("private-chat");
		containerToWrite.classList.remove('disabled');
		document.getElementById("private-text").removeAttribute("disabled");
		msg.text = punycode.ToUnicode(utf8.decode(msg.text));
		// If the other user has updated name, update the client.
		chattingWith = {id: msg.with.id, username: msg.with.username};
		chattingWithUsers = JSON.parse(msg.users);
		chattingWith.id = thisClientId === chattingWithUsers[0]?chattingWithUsers[1]:chattingWithUsers[0];
		//console.log('id :'+chattingWith.id+' arr :'+arr_users_temp);
		var item = search(chattingWithUsers[0], arr_users_temp); //arr_users_temp.find(item => item.id === chattingWith.id);
		//if (!msg.with.self) {
			containerHeader = document.querySelector("#private-chat");
			//containerHeader.innerHTML += `Your chat with - ${item.text}+'<br/>`;
		//}
		text = `<b>${item.text} - ${msg.text}</b> sent at ${timeStr}<br />`;
		break;
	}
	if (text.length) {
		containerToWrite.innerHTML = containerToWrite.innerHTML + text;
		containerToWrite.scrollTop = containerToWrite.scrollHeight;
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