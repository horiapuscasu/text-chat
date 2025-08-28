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
  }

  // Send the msg object as a JSON-formatted string.
  chatSocket.send(CryptoJS.AES.encrypt(JSON.stringify(msg),pass_enc).toString());
}

/**
 * Renders the message received into browser.
 * 
 * @param {string} msg - the actual message object.
 */
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
      containerToWrite = document.getElementById("user-list");
      let userListText = '', userJoinedAt;
      msg.users.map(user => {
        userJoinedAt = new Date(user.date).toLocaleTimeString();
		/*if(chatuser == user.text && chatuser!=null){
			thisClientId = user.id;
		}*/
        if (thisClientId === user.id) {
          userListText += `<b>${user.text}</b> (${userJoinedAt})<br />`;
        }
        else {
          userListText += `<b><a href="#" style="color:navy;" data-id="${user.id}"
            title="Chat with ${user.text}">${user.text}</a></b> (${userJoinedAt})<br />`;
        }
      });
      containerToWrite.innerHTML = userListText;
      containerToWrite.scrollTop = containerToWrite.scrollHeight;
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
      containerToWrite.innerHTML = `<div style="color:navy;">Chatting with - ${msg.with.username}</div>`;
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
msg.text = punycode.ToUnicode(utf8.decode(msg.text));
      // If the other user has updated name, update the client.
      if (!msg.with.self && msg.with.id === chattingWith.id) {
        containerHeader = document.querySelector("#private-chat .header");
        containerHeader.innerHTML = `Your chat with - ${msg.with.username}`;
      }
      text = `<b>${msg.with.username} - ${msg.text}</b> sent at ${timeStr}<br />`;
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