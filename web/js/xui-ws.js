xui.define("xui/ws", function(require, exports, module) {
	"use strict";
	const wsMap={}
	const toBytes = str => {
	  const utf8 = [];
	  for (let ii = 0; ii < str.length; ii++) {
		let charCode = str.charCodeAt(ii);
		if (charCode < 0x80) utf8.push(charCode);
		else if (charCode < 0x800) {
		  utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
		} else if (charCode < 0xd800 || charCode >= 0xe000) {
		  utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
		} else {
		  ii++;
		  // Surrogate pair:
		  // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
		  // splitting the 20 bits of 0x0-0xFFFFF into two halves
		  charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
		  utf8.push(
			0xf0 | (charCode >> 18),
			0x80 | ((charCode >> 12) & 0x3f),
			0x80 | ((charCode >> 6) & 0x3f),
			0x80 | (charCode & 0x3f),
		  );
		}
	  }
	  return utf8;
	}
	const toUtf8 = bytes => {
	  var out = [], pos = 0, c = 0;
	  while (pos < bytes.length) {
		var c1 = bytes[pos++];
		if (c1 < 128) {
		  out[c++] = String.fromCharCode(c1);
		} else if (c1 > 191 && c1 < 224) {
		  var c2 = bytes[pos++];
		  out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
		} else if (c1 > 239 && c1 < 365) {
		  // Surrogate Pair
		  var c2 = bytes[pos++];
		  var c3 = bytes[pos++];
		  var c4 = bytes[pos++];
		  var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
			  0x10000;
		  out[c++] = String.fromCharCode(0xD800 + (u >> 10));
		  out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
		} else {
		  var c2 = bytes[pos++];
		  var c3 = bytes[pos++];
		  out[c++] =
			  String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
		}
	  }
	  return out.join('');
	}
	const getByteLength = (s, b, i, c) => {
	  for (b = i = 0; (c = s.charCodeAt(i++)); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
	  return b;
	}
	const checkDelete = id => {
		let ws=websocket(id)
		if( ws && ws.readyState>1 ) {
			ws.close()
			delete wsMap[id]
			return null;
		}
		return ws;
	}
	const checkConnect = () => {
		for(let k in wsMap) {
			let ws=websocket(k)
			if( ws && ws.readyState>1 ) {
				const {id, host, port, startTick} = ws.infoNode;
				if( startTick>0 ) {
					const dist=new Date().getTime() - startTick;
					if( dist <2000 ) continue;
				}
				connect(id, host, port)
			}
		}
	}
	const wsOpen 	= e => clog("websocket open =>", e.target )
	const wsClose 	= e => checkDelete(websocketId(e.target))
	const wsMsg 	= e => parseMessage(e.target, e.data)
	const wsErr 	= e => clog("websocket error =>", e, websocketId(e.target) )
	const connect = (id, host, port) => {
		let ws=checkDelete(id)
		if(ws) return ws;
		if(!port) port=8092
		if(!host) host='localhost'; 
		const startTick = new Date().getTime()
		const node = {id, host, port, startTick};
		ws=new WebSocket("ws://"+host+":"+port+"/message")
		ws.onmessage 	= wsMsg
		ws.onopen 		= wsOpen
		ws.onclose		= wsClose
		ws.onerror		= wsErr
		ws.infoNode		= node;
		wsMap[id]=ws;
		return ws;
	}
	const websocket = id => wsMap[id]
	const websocketId = ws => {
		for(var id in wsMap) {
			if(ws==wsMap[id]) return id
		}
		return null
	}
	 
	const sendWs = (id, serviceId, header, contentType, info, data) => {
		const ws=this.websocket(id)
		if(ws && ws.readyState==1 ) {
			if(!info) info=''
			size=getByteLength(data)
			ws.send('@'+serviceId+':'+header+'\r\n'+contentType+','+size+','+info+'\r\n'+data);
		}
	}
	const sendMessage = (id, msg) => {
		const ws=this.websocket(id)
		if(ws && ws.readyState==1 ) {
			ws.send(msg);
		}
	}
	const parseMessage = (ws, data) => {
		let sp=0, ep=data.indexOf("\r\n");
		if( ep==-1 ) return clog("websocket recive start error", data)
		const line = data.substring(sp,ep);
		sp=ep+2;
		ep=data.indexOf("\r\n\r\n", sp)
		if( ep==-1 ) return clog("websocket recive header end error", data)
		if( line.charAt(0)!='@') return clog("websocket recive start char error", line)
		const info = data.substring(sp,ep);
		sp=1, ep=line.indexOf(':',sp)
		if( ep==-1 ) return clog("websocket recive service type parse error", line)
		
		const type= line.substring(sp,ep);
		const errorCode=line.substring(ep+1).trim()
		sp=0,ep=info.indexOf(',',sp)
		if( ep==-1 ) return clog("websocket recive content type parse error", info)
		const contentType=info.substring(sp,ep).trim()
		sp=ep+1,ep=info.indexOf(',',sp)
		if( ep==-1 ) return clog("websocket recive size parse error", info)
		const size=info.substring(sp,ep).trim()
		if(isNum(size)) return clog("websocket recive size is not number", info) 
		const message=info.substring(ep+1).trim()
		
		if(typeof exports.messageProc=='function') {
			exports.messageProc(type, errorCode, contentType, result, message, data)
		} else {
			clog('meesageProc callback function not defined : ',type, errorCode, contentType, result, message, data)
		}
	}
	const node = {wsMap, connect, websocket, websocketId, sendWs, sendMessage, parseMessage }
	for(let key in node ) {
		exports[key]=node[key]	
	}
});


<func note="WEB Socket SERVICE function">
	 
	@wss.start(port) {
		not(port) port=8092
		server=Baro.server('websocket')
		server.var(type, 'websocket')
		server.start(8092, @wss.serverAccept, "proxy", 2500);
		server.callbackClient(@wss.websocketClient);		
	}
	@wss.echoSend() {
		server=Baro.server('websocket')
		tm=System.localtime()
		while(client, server ) {
			@wss.sendService(client, 'echo', 200, 'text', 'ok', "system date==$tm")
		}
	}
	
	@wss.serverAccept(type, client) {
		print("webSocketServer type==$type" );
	    switch(type) {
	    case clientClose:
			print("사용자 연결종료", client );
	    default:
	    }
	}
	@wss.websocketClient(client, type) {
		config=client.config()
		switch(type) {
		case start:
			client.first=true;
			client.var(type, 'websocket')
		case connect:
			print("client connect", client);
		case recv:
			if( client.first ) {
				config.recvRemainSize=0;
				config.recvData='';
			    client.first=false;
			    data=client.readAll();
			    print("xxxx 웹소켓 핸드세이크 xxxx", data );
			    @wss.socketHandshake( client, data );
			} else {
				data=client.readWs()
				if(data) {
					@wss.socketMessageProc(client, data);
				}
			}
		default:
			client.close();
		}
	}
	
	@wss.socketHandshake(client, &data) {	   
	    header=data.findPos("\r\n\r\n");
	    print("websocket handshake header==$header");
	    while( header.valid(), n, 0 ) {
			line=header.findPos("\r\n");
			if( n.eq(0) ) {
				client.set("reqInfo", line.trim() );
			} else {
				key=line.findPos(':').trim();
				value=line.trim();
				client.set(key, value);
			}
	    }
	    rst='';
	    key=client.get('Sec-WebSocket-Key');
	    if( key ) {
			key.add('258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
			accept=Cf.handshakeKey(key);
			rst.add("HTTP/1.1 101 Switching Protocols\r\n");
			rst.add("Upgrade: websocket\r\n");
			rst.add("Connection: Upgrade\r\n");
			rst.add("Sec-WebSocket-Accept: ${accept}\r\n");
			// rst.add("Sec-WebSocket-Protocol: chat\r\n");
			rst.add("\r\n");
			print("websocket responce==$rst, key=$key");
			client.sendData(rst);
	    }
	}
	
	@wss.socketMessageProc(client, &data) {
		config=client.config()
		line0=data.findPos("\r\n");
		line1=data.findPos("\r\n\r\n");
		if( line0.ch('@')) {
			line0.incr();
		} else {
			config.errorCode="400"
			print("웹소켓 헤더오류 ",config.recvRemainSize );
			return
		}
		type		= line0.findPos(':').trim();
		header		= line0.trim();
		
		contentType	= line1.findPos(',').trim()
		size		= line1.findPos(',').trim()
		info		= line1.trim();
		
		print(">> 웹소켓 메시지처리 시작 $type ==>  $header", data.size(), size, contentType )
		if( size > data.size() ) {
			config.recvRemainSize = size - data.size();
			config.recvData=data;
			config.with(type, header, contentType)
			print("소켓 요청 크기오류 [$type : $header]", type, header, contentType, size, config.recvRemainSize);
			return;
		}
		@wss.socketMessageApply(client, type, header, contentType, data, info)
	}
	@wss.socketMessageApply(client, type, &header, &contentType, &data, &info) {
		print("socketMessageApply", type, header, data.size() );
		if( type=='api') {
			service=header.findPos("/").trim()
			uri=header.trim()
			param=_node()
			result=@wss.apiService(service, uri, param, buffer);
			not(result) result=param;
			err=Cf.error();
			if(err) {
				if(typeof(result,'node')) result.error=err;
			}
			data=''
			if( typeof(result,'node')) {
				if(result.var(checkSend)) return;
				data=@json.listData(result)
				contentType='json'
			} else {
				data=result.trim()
				contentType='text'
			}
			@wss.sendService(client, type, 200, contentType, "ok", uri, data)
		} else if(type=='echo') {
			@wss.sendService(client, 'echo', 200, 'echo', 'ok', info, data)
		} else if(type=='imageSend') {
			user=header.findPos("/").trim()
			name=header.trim()
			savePath="data/clipboard_captures/$name";
			fileWrite(savePath, data);
			@wss.sendService(client, type, 200, contentType, "ok", "$user/$name", savePath)
		} else {
			
		}
	} 
	@wss.sendService(client, type, errorCode, contentType, result, message, data) {
		not(type) return;
		size=data.size();
		client.sendWs("@${type}:${errorCode}\r\n${contentType}, ${size},${result},${message}\r\n\r\n${data}");
	}
	@wss.sendAddminMessage(type, errorCode, contentType, result, message, data) {
		server=Baro.server('websocket')
		find = func() {
			while(client, server ) {
				if(client.admin) return client;
			}
			return null
		};
		admin=server.var(adminClient)
		not(admin) admin=find()
		not(admin) return print("웹소켓 어드민 사용자가 등록되지 않았습니다")
		@wss.sendService(admin, type, errorCode, contentType, result, message, data)
	}
	@wss.apiService(service, &uri, param, buffer) {
		fo=Baro.file('api');
		vars=null;
		objectId=service;
		if(uri.find('/') ) {
			name=uri.findPos('/').trim();
			fileName="web/api/${service}.${name}.js";
			if(fo.isFile(fileName)) {
				objectId="${service}.${name}";
				name=uri.findPos('/').trim();
			} else {
				fileName="web/api/${service}.js";
			}
			vars=uri.trim();
		} else {
			name=uri.trim();
			fileName="web/api/${service}.js";
		}
		serviceNode=Cf.getObject("api", objectId, true);
		modifyTm=fo.modifyDate(fileName);
		not(modifyTm.eq(serviceNode.lastModifyTm)) { 
			src=stripJsComment(fileRead(fileName));
			serviceNode.lastModifyTm=modifyTm;
			serviceNode[$src];
		}
		fc=serviceNode[$name];
		if(typeof(fc,'func')) {
			return fc(req, param, vars, buffer)
		} else {
			param.error="$fileName 파일에 $name 함수미정의")
		}
		return param;
	}
</func>


