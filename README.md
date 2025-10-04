Highly apreciated if using this because me here to self-distinguish.

Nodejs application for Windows- for this you  need installed only Nodejs no extra-typica(only Next button like always)

Based on(the emojis and file transfer added by me) https://github.com/sumanchalki/private-public-chat-websocket text chat , file transfer and emoji in pass1 digest passwords https://websistent.com/tools/htdigest-generator-tool/ realm / module ws of node https://localhost:3129 and https://localhost:8080 when behind nginx(installed even https://github.com/horiapuscasu/video-chat) see in instructions
Accordind to stackoverflows ~ 450 connections/websockets for ws module of node.
Delete package.json and package-lock.json in kit before installing.

When no button Enter after the messages even on Enter

<img src="https://github.com/horiapuscasu/text-chat/blob/main/Untitled.png" height="500" width="600">


Drag and rop the icon of the file from windows explorer for file transfer(resiZe the windows of the browser and windows explorer and put side by side to be able) click after on the link of the file first to change color and after 2nd time to download

the text messages and the file transfer(the file save encrypted you loose the conversation you loose the password and loose the file-text with a .txt file) are  secured by AES encryptiuon 

File transfer 18.5 MB of file

If you want to protect with nginx for ddos attack do the same like https://github.com/horiapuscasu/video-chat and modify c:\nginx\conf\nginx.conf but because cannot proxy / for both chats cannot have both chats on the same computer here to proxy to port 3129 you can have both behing nginx on diffrenet prots if for instance and this on https://localhost:8080

server {
		listen 443 ssl;
		server_name localhost;

		ssl_certificate ssl/server-cert.pem;
		ssl_certificate_key ssl/server-key.pem;

		location / {
			proxy_pass https://127.0.0.1:8081/;
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
			proxy_set_header Host $host;
			# ... other proxy settings
		}
	}
	server {
		listen 8080 ssl;
		server_name localhost;

		ssl_certificate ssl/server-cert.pem;
		ssl_certificate_key ssl/server-key.pem;

		location / {
			proxy_pass https://127.0.0.1:3129/;
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
			proxy_set_header Host $host;
			# ... other proxy settings
		}
	}

The initial for authorization digest admin with a

To generate one certificate in Windows one apache for Windows and c:\apache\bin\openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US/ST=New York/L=New York/O=none/CN=localhost" -keyout server.key -out server.crt

See instatructions aka read me.txt for instructions.Use install_chat.bat to install.

I'm not registered to offer a license for warranty on any existing even licenses like MIT which no liability

Not usable for mobile browser  for those some other javascript.

The chat has no resources from the internet can work isolated on a LAN
