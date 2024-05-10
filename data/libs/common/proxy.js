## 파일나누기 합치기
f=Baro.file'test')
f.open('c:/Baro/baro.exe','read')
size=f.size()
chunck=1024*1024
while(size.gt(0)) {
	d=f.read(chunck)
	not(d.size()) break;
	size-=d.size()
	print("size==$size")
	idx++;
	fileWrite("c:/Temp/c-${idx}.data", d)
}
f.seek(0)
f.close()
~~
fa=Baro.file('append')
fa.open('c:/Temp/aa.exe', 'append')
f.var(nameFilter,'c-*.data')
f.var(sort,'name')
f.list('c:/Temp', func(info) {
	while(info.next()) {
		info.inject(type, name, fullPath)
		fa.append(fileRead(fullPath))
	}
})
fa.close()

## 프록시 서버 구현
class ProxyClient {
	workers=_arr('proxyWorkers')
	start(clientId, ip, port, timeout) {
		not(clientId) return print("장치아이디를 등록하세요");
		not(ip) ip='localhost';
		not(port) port=8093;
		not(timeout) timeout=2500;
		call(func() {
			client=this;
			socket=Baro.socket(clientId)
			worker=Baro.worker(clientId)
			workers.add(worker)
			worker.start(func() { client.clientProc(this) }, true, 100)
		})
	} 
	send(type, prop, data) {
		not(prop) {
			tm=System.localtime()
			prop="tm:$tm"
		}
		size=data.size()
		socket.sendData("##>$type:$size{$prop}\r\n$data")
	}
	clientProc(worker) {
		not(socket) {
			return System.sleep(1000);
		}
		if( socket.isRead(500) ) {
			data=socket.recvData();
			print("proxy recv data==$data"); 
			if(typeof(data,'bool')) {
				socket.close();
				print("proxy read data error", this);
				return;
			}
			not(data) {
				socket.close()
				return;
			}
			this.clientParse(socket, data);
		}
		not(socket.isConnect()) {
			print("socket connect start", ip, port);
			if(socket.connect(ip,port,timeout)) { 
				if( this.send("login",clientId) ) {
					if(socket.isRead(500)) {
						result=socket.recvData();
						print("connect result == $result");
					} else {
						print("connect recv timeout", socket);
					}
				}
			}
		}
	}
	clientParse(socket, &data) {
		print("PROXY CLIENT PARSE data==$data")
		str=data;
		data.findPos('##>');
		line=data.findPos("{",1,1);
		not(data.ch('{')) {
			return print("proxy client recv protocal error DATA:$str");
		}
		type=line.findPos(':').trim();
		size=line.findPos(':').trim();
		props=data.match(1);
		data.findPos("\r\n");
		param=this.addNode("param").removeAll(true);
		param.parseJson(props);
		result=null;
		if(type=='api') {
			uri=line;
			if(uri.ch('/')) uri.incr();
			service=uri.findPos('/').trim();
			name=null, vars=null;
			if(uri.find('/') ) {
				name=uri.findPos('/').trim();
				fileName="web/api/${service}.${name}.js";
				if(isFile(fileName)) {
					name=uri.findPos('/').trim();
				} else {
					fileName="web/api/${service}.js";
				}
				vars=uri.trim();
			} else {
				name=uri.trim();
				fileName="web/api/${service}.js";
			}
			serviceNode=object("api.${service}");
			modifyTm=Baro.file('proxy').modifyDate(fileName);
			not(modifyTm.eq(serviceNode.lastModifyTm)) {
				@api.addServiceFunc(serviceNode, fileRead(fileName));
				serviceNode.lastModifyTm=modifyTm;
			}
			fc=serviceNode.get(name);			
			if( param.get("range")) {
				socket.setValue("Range", param.get("range"));
			} else {
				socket.socketClear("Range","rangeStart","rangeEnd");
			}
			if(typeof(fc,'function')) {
				result=fc(socket, param, vars, data);
			}
			not(result) {
				result=param;
				result.error="$service $name API호출 오류(URI:$line)";
			}		
		} else {
			result=param;
			result.error="PROXY 타입오류 (타입:$type)";
		}
		conf=socket.config()
		conf.var(sendCheck, false);
		if( typeof(result,'node')) {
			if(result.var(checkSend)) return;
			socket.send(@json.listData(result) );
		} else {
			socket.send(result);
		}
		print("proxy client send ok")
	}
}



<func note="PROXY SERVICE function">
	proxyController(req, param, &url, proxy ) {
		print("PROXY CONTROL START URL:$url")
		not(url.start('/proxy/',true)) return @proxy.sendError(req, param, "proxy client start error [URL:$url]");
		uid=url.findPos('/').trim();
		client=proxy.get(uid) not(client) return @proxy.sendError(req, param, "proxy client connect error [ID:$uid URL:$url]");
		client.isCall(true)
		tm=System.localtime();
		header='';
		header.add('"uid":', Cf.jsValue(uid));
		header.add(', "localtime":', Cf.jsValue(tm)); 
		if(req.getValue('Range')) {
			header.add(', "range":', Cf.jsValue(req.getValue('Range')));
		}
		if(req.getValue('boundary')) {
			header.add(', "boundary":', Cf.jsValue(req.getValue('boundary')));
		}
		size=req.getValue('Content-Length') not(size) size=0;
		packet="##>api:$size:$url{$header}\r\n";
		if(size) {
			post=req.getBuffer();
			print("send post size:$size", post);
			packet.add(post);
		}
		ok=false;
		client.sendData(packet)
		if( client.isRead(5000) ) {
			result='';
			recv=client.recvData()
			while(recv) {
				result.add(recv)
				remain=client.config('@remain')
				print(">> ######" , result.size(), remain);
				not(remain) break
				recv=client.recvData()
			}
			print("result==========", result.size())
			not(req.isConnect() ) {
				print("################# web closed !!! ")
			}
			if(result) {
				req.sendData(result)
				ok=true;
			}
		} else {
			print("read timeout");
		}
		not(ok) req.send("error")
	}	
</func>

<func note="proxy server function">
	@proxy.start() {
		server=Baro.was("proxy")
		server.startServer(8093, @proxy.serverDispatch, "proxy", 2500);
	}

	@proxy.serverDispatch(client, proxy) {
		if(client.isCall()) {
			print("serverDispatch 프록시 클라이언트 처리중")
			return;
		}
		data=client.recvData();
		if(typeof(data,'bool')) {
			client.close();
			return;
		}
		data.ref();
		data.findPos('##>');
		line=data.findPos("{",1,1) not(data.ch('{')) return print("PROXY SERVER protocal error $data")
		type=line.findPos(':').trim();
		size=line.findPos(':').trim();
		props=data.match();
		data.findPos("\r\n");
		print("PROXY SERVER DISPATCH START TYPE:$type")
		msg='';
		if(type=='login') {
			uid=data.trim();
			prev=proxy.get(uid);
			if(prev) {
				print("prev==", prev.getValue());
				if(prev==client) {
					msg='error:already connect';
				} else {
					msg='ok:client reset';
					proxy.set(uid, client);
				}
			} else {
				msg='ok';
				print("login ok UID:$uid");
				client.setValue('@uid', uid);
				proxy.set(uid, client);
			}			
		} else {
			msg='ok';
		}
		size=msg.size();
		packet="##>$type:$size\r\n$msg";
		client.sendData(packet);
	}
</func>

<func note="proxy client function">
	@proxy.clientStart(deviceId, ip, port, timeout) {
		not(deviceId) return print("장치아이디를 등록하세요");
		not(ip) ip='localhost';
		not(port) port=8093;
		not(timeout) timeout=2500;
		socket=Baro.socket('proxy');
		worker=Baro.worker('proxy');
		worker.with(ip,port,timeout,socket, deviceId);
		worker.start(@proxy.clientProc, true, 100)
		return worker;
	}
	@proxy.clientProc() {
		socket=this.socket;
		not(socket) {
			return System.sleep(1000);
		}
		if( socket.isRead(500) ) {
			data=socket.recvData();
			print("proxy recv data==$data"); 
			if(typeof(data,'bool')) {
				socket.close();
				print("proxy read data error", this);
				return;
			}
			not(data) {
				socket.close()
				return;
			}
			@proxy.clientParse(socket, data);
		}
		not(socket.isConnect()) {
			this.inject(ip,port,timeout,deviceId);
			print("socket connect start", ip, port);
			if(socket.connect(ip,port,timeout)) {
				print("socket connect ok");
				tm=System.localtime();
				size=deviceId.size();
				if( socket.sendData("##>login:$size{tm:$tm}\r\n$deviceId") ) {
					if(socket.isRead(500)) {
						result=socket.recvData();
						print("connect result == $result");
					} else {
						print("connect recv timeout", socket);
					}
				}
			}
		}
	}
	@proxy.clientParse(socket, &data) {
		print("PROXY CLIENT PARSE data==$data")
		str=data;
		data.findPos('##>');
		line=data.findPos("{",1,1);
		not(data.ch('{')) {
			return print("proxy client recv protocal error DATA:$str");
		}
		type=line.findPos(':').trim();
		size=line.findPos(':').trim();
		props=data.match(1);
		data.findPos("\r\n");
		param=this.addNode("param").removeAll(true);
		param.parseJson(props);
		result=null;
		if(type=='api') {
			uri=line;
			if(uri.ch('/')) uri.incr();
			service=uri.findPos('/').trim();
			name=null, vars=null;
			if(uri.find('/') ) {
				name=uri.findPos('/').trim();
				fileName="web/api/${service}.${name}.js";
				if(isFile(fileName)) {
					name=uri.findPos('/').trim();
				} else {
					fileName="web/api/${service}.js";
				}
				vars=uri.trim();
			} else {
				name=uri.trim();
				fileName="web/api/${service}.js";
			}
			serviceNode=object("api.${service}");
			modifyTm=Baro.file('proxy').modifyDate(fileName);
			not(modifyTm.eq(serviceNode.lastModifyTm)) {
				@api.addServiceFunc(serviceNode, fileRead(fileName));
				serviceNode.lastModifyTm=modifyTm;
			}
			fc=serviceNode.get(name);			
			if( param.get("range")) {
				socket.setValue("Range", param.get("range"));
			} else {
				socket.socketClear("Range","rangeStart","rangeEnd");
			}
			if(typeof(fc,'function')) {
				result=fc(socket, param, vars, data);
			}
			not(result) {
				result=param;
				result.error="$service $name API호출 오류(URI:$line)";
			}		
		} else {
			result=param;
			result.error="PROXY 타입오류 (타입:$type)";
		}
		conf=socket.config()
		conf.var(sendCheck, false);
		if( typeof(result,'node')) {
			if(result.var(checkSend)) return;
			socket.send(@json.listData(result) );
		} else {
			socket.send(result);
		}
		print("proxy client send ok")
	}
</func>


<func note="proxy util function">
	@proxy.sendError(req, param, msg) {
		param.error=msg;
		req.send(@json.listData(param));
	}
	@proxy.parsePostBoundary(req, boundary) { 
		buf=req.readBuffer();
		contentLength=req.getValue("Content-Length"); 
		boundCheck=Cf.val('--',boundary);
		print(">> multipartParse boundCheck: $boundCheck", contentLength, buf.size() );
		buf.findPos(boundCheck);
		blob=null;
		post.add('"boundary":', Cf.jsValue(boundary));
		while( buf.valid(), n, 0 ) {
			left=buf.findPos(boundCheck);
			header=left.findPos("\r\n\r\n");
			not(header.ch()) break; 
			node=@api.multipartHeader(header);
			node.inject(name, filename);
			not( name ) continue;
			contentType=node.get("Content-Type");
			if(filename) {
				post.add(',"$name":', Cf.jsValue(filename));
				blob=left.findLast("\r\n");
			} else {
				val=left.trim();
				post.add(',"$name":', Cf.jsValue(val));
			}
		}
		post.add(boundCheck, blob);
	}
</func>
