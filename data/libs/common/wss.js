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

