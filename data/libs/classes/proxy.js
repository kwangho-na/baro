class func {
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
		print("web => client send packet ", packet)
		if( client.isRead(5000) ) {
			result='';
			while(true) {
				recv=client.recvData()
				not(recv) break;
				result.add(recv)
			}
			print("proxy web read size == ", result.size())
			not(req.isConnect() ) {
				print("proxy web closed !!! ")
			}
			not(result) result=@proxy.errorData()
			req.send(result)
		} else {
			print("read timeout");
		}
	}
	@proxy.errorData() {
		data="proxy api error: $client $packet"
		return data;
	}
}

class ProxyServer {
	server=Baro.was("proxy")
	callback=null
	start(port) {
		not(port) port=8093
		server.var(module, this)
		server.startServer(port, 
			func(client, proxy) {
				server=client.server()
				print("proxy dispatch ", client, server)
				if( client.isCall()) {
					print("clientDispatch 프록시 클라이언트 처리중")
					return;
				}
				data=client.recvData();
				if( typeof(data,'bool')) {
					client.close();
					return;
				}
				server.var(module).dispatch(client,proxy,data)		
			}, 
			"proxy", 2500
		);
		print("proxy server started ", server)
	}
	stop() {
		server.stop()
	}
	send(client, type, uri, data, props) {
		not(props) {
			tm=System.localtime()
			props="tm:$tm"
		}
		size=data.size()
		client.sendData("##>$type:$size:$uri{$props}\r\n$data")
	}
	dispatch(client,proxy,&data) {
		line=data.findPos('##>') if(line.size() > 32 ) return print("PROXY SERVER dispatch start error line=$line")
		line=data.findPos("{",1,1) not(data.ch('{')) return print("PROXY SERVER protocal error line=$line")  
		type=line.findPos(':').trim()
		size=line.findPos(':').trim()
		uri=line.trim()
		props=data.match()
		data.findPos("\r\n")
		not(data.size().eq(size)) {
			remain=data.size() - size;
			print("proxy server dispatch not match recv size ", data.size(), size, remain)
			if(remain) {
				data.add(client.recvData(remain))
			}
		}
		print("PROXY SERVER DISPATCH START TYPE:$type", proxy)
		if(type=='error') { 
			return this.error_req(client, proxy, uri, props, data, size)
		} 
		if(type=='login') { 
			return this.login_req(client, proxy, uri, props, data, size)
		} 
		if(type.find('_ok') ) {
			name=type
		} else {
			name="${type}_req"
		}
		fc=this.get(name)
		if(typeof(fc,"func")) {
			call(fc, this, client, proxy, uri, props, data, size)
		} else {
			print("프록시 서버 응답함수 오류 [ProxyServer $name 함수 미정의]")
		}
	}
	error_req(client, proxy, uri, props, data, size) {
		print("server recv error ", uri, data, props)
	}
	login_req(client, proxy, uri, props, data, size) {
		uid=data.trim()
		prev=proxy.get(uid)
		if(prev) {
			print("login prev==", prev.getValue())
			if( prev==client) {
				msg='error:already connect';
			} else {
				msg='ok:client reset';
				proxy.set(uid, client);
			}
		} else {
			msg='ok';
			client.setValue('@uid', uid);
			proxy.set(uid, client);
		}
		this.send(client,"login_ok", uri, msg)
	}
	api_req(client, proxy, &uri, &data, &props) {
		conf=client.config()
		param=conf.addNode("param").removeAll(true)
		if(props) param.parseJson(props)
		a=class("ProxyData").apiResult(uri, data, param)
		result=when(typeof(a,'node'), @json.listData(a), a)
		this.send(client, "apiResult_ok", uri, result)
	}
}


class ProxyClient {
	workers=_arr('proxyWorkers')
	start(clientId, ip, port, timeout) {
		not(clientId) return print("장치아이디를 등록하세요");
		not(ip) ip='localhost';
		not(port) port=8093;
		not(timeout) timeout=2500;
		call(func() {
			self=this
			socket=Baro.socket(clientId)
			worker=Baro.worker(clientId)
			worker.start(this.socketProc, true, 100)
			idx=workers.find(worker)
			if(idx.eq(-1)) {
				idx=worker.size()
				workers.add(worker)
			}
			worker.funcNode=Cf.funcNode()
		});
	}
	funcNode(id) {
		while(w, workers) {
			not(w.funcNode) continue
			w.funcNode.inject(clientId, socket)
			if(id.eq(clientId)) return w.funcNode;
		}
		return;
	}
	isConnect(id) {
		fn=this.funcNode(id) not(fn) return;
		fn.inject(socket, worker)
		return socket.isConnect()
	}
	closeClient(id) {
		fn=this.funcNode(id) not(fn) return;
		fn.inject(socket, worker)
		idx=workers.find(worker)
		not(idx.eq(-1)) workers.remove(idx)
		worker.close()
		socket.close()
		fn.delete()
	}
	closeAll() {
		while(w, workers) {
			not(w.funcNode) continue
			w.funcNode.inject(clientId, socket, worker)
			worker.close()
			socket.close()
		}
		workers.reuse()
	}
	send(socket, type, uri, data, props) {
		not(socket.isConnect()) return print("proxy send not connect $type");
		not(props) {
			tm=System.localtime()
			props="tm:$tm"
		}
		size=data.size()
		socket.sendData("##>$type:$size:$uri{$props}\r\n$data")
	}	
	sendClient(id, type, uri, data, props) {
		fn=this.funcNode(id)
		not(fn) return print("send client error [$id client not found]");
		fn.inject(socket, worker)
		this.send(socket, type, uri, data, props)
	}	
	socketProc() {
		not(socket) {
			print("client process socket is null", clientId, ip, port, socket)
			return System.sleep(1000);
		}
		if( socket.isRead(500) ) {
			data=socket.recvData();
			if(typeof(data,'bool')) {
				self.var(error,"proxy client maybe closed");
				return;
			}
			not(data) {
				self.var(error,"proxy client empty data");
				return;
			}
			self.clientRecv(socket, data);
		}
		if( self.var(error) ) {
			tick=self.var(errorTick)
			if(tick) {
				d=System.tick() - tick
				if(d>1000) {
					print("proxy client error tick==$d", self.var(error) )
					self.var(error, '')
					self.var(errorTick, 0)
				}
			} else {
				self.var(errorTick, System.tick() )
			}
			return;
		}
		not(socket.isConnect()) {
			fn=Cf.funcNode("parent");
			print("socket connect start", clientId, ip, port, fn.get() );
			if(socket.connect(ip,port,timeout)) { 
				if( self.send(socket,"login","",clientId) ) {
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
	
	clientRecv(socket, &data) {
		not(data.ch()) return print("proxy client recv data error", socket);
		print("PROXY CLIENT PARSE data==$data")
		str=data
		data.findPos('##>')
		line=data.findPos("{",1,1)
		not(data.ch('{')) {
			return print("proxy client recv protocal error DATA:$str");
		}
		type=line.findPos(':').trim()
		size=line.findPos(':').trim()
		props=data.match(1)
		data.findPos("\r\n")
		param=paramNode(true, props)
		not( size.eq(data.size()) ) {
			remain=size-data.size()
			if(remain.gt(0) ) {
				data.add(socket.recvData(remain))
			}
		}
		uri=line.trim()
		if(type=='error') {
			return this.error_res(socket, uri, data, param)
		} 
		if(type=='api') {
			return this.api_res(socket, uri, data, param)
		} 
		if(type.find('_ok') ) {
			name=type
		} else {
			name="${type}_res"
		}
		func=this.get(name)
		if(typeof(func,"func")) {
			call(func, this, socket, uri, data, param)
		} else {
			print("프록시 응답 처리오류 [ProxyClient $name 함수 미정의]")
		}
	}
	api_res(socket, &uri, &data, param) {
		if( param.get("range")) {
			socket.setValue("Range", param.get("range"));
		} else {
			socket.socketClear("Range","rangeStart","rangeEnd");
		}
		a=class('ProxyData').apiResult(uri, data, param)
		result=when(typeof(a,'node'), @json.listData(a), a)
		
		socket.sendData(result)
	}
	error_res(socket, &uri, &data, param) {
		print("에러처리 응답", uri, data, param);
	}
	login_ok(socket, &uri, &data, param) {
		print("로그인 처리응답 ", uri, data, param);
	}
	apiResult_ok(socket, &uri, &data, param) {
		print("api 호출 응답 ", uri, data, param);
	}
}


class ProxyData {
	chunSize=4*1024*1024
	sendMaps=this.addNode("@sendMaps")
	apiResult(&uri, &data, param) {
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
		
		if(typeof(fc,'function')) {
			result=fc(socket, param, vars, data);
		}
		not(result) {
			result=param;
			result.error="$service $name API호출 오류(URI:$line)";
		}
		return result;
	}
	makeChunckFile(path, ref) {
		fp=Baro.file('chunck')
		not(fp.open(path,"read")) return print("파일조각 만들기 실패 ($path 파일읽기 오류)");
		pathTemp=Cf.val(System.path(),"/data/temp");
		idx=0
		size=fp.size()
		while(size.gt(0)) {
			data=fp.read(chunSize) 
			read=data.size()
			not(read) break;
			size.incr(read, false)
			idx.incr()
			num=lpad(idx, 4)
			fileWrite("${pathTemp}/${ref}-${num}.data", data)
		}
		fp.close()
	}
	makeOriginFile(path, ref) {
		fp=Baro.file('chunck')
		if(fp.isFile(path)) {
			fp.delete(path)
		}
		not(fp.open(path,"append")) return print("파일생성 실패 ($path 파일오류)");
		pathTemp=Cf.val(System.path(),"/data/temp");
		fp.var(nameFilter,"${ref}-*.data")
		fp.var(sort,"name")
		fp.list(pathTemp, func(info) {
			while(info.next()) {				
				info.inject(type, name, ext, fullPath)
				print("full path==$fullPath")
				fp.append(fileRead(fullPath));
			}
		})
		fp.close()
	}
	nextChunckSend(client, ref, reset) {
		ret='';
		if(reset) sendMaps.reuse(true)
		pathTemp=Cf.val(System.path(),"/data/temp");
		fp=Baro.file('chunck')
		fp.var(nameFilter,"${ref}-*.data")
		fp.var(sort,"name")
		fp.list(pathTemp, func(info) {
			while(info.next()) {				
				info.inject(type, name, ext, fullPath)
				state=sendMaps.get(name)
				if(state=="ok") {
					continue;
				}
				data=fileRead(fullPath)
				sendMaps.set(name, "start")
				if(client) {
					client.send("fileChunck", data, "name:$name,ref:$ref")
				}
				ret.add(name)
				break;
			}
		})
		return ret;
	}
	chunckSendOk(client, name, ref) {
		sendMaps.set(name,"ok")
		pathTemp=Cf.val(System.path(),"/data/temp");
		Baro.file().delete("$pathTemp/$name")
		next=this.nextChunckSend(this, ref)
		not(next) this.fileSendEnd(name, ref)
	} 
	gitFileDownload(client, name, path) {
		this.webDownload("https://raw.githubusercontent.com/kwangho-na/baro/na/$name", path)
	}
	webDownload(client, url, path, callback) {
		not(isFile(path)) return print("웹다운로드 파일오류 ($path 파일을 찾을 수 없습니다)")
		call(func() {
			web=Baro.web("down") 
			web.download(url, path, this.webDownloadProgress)
			setCallback('webDownload', true)
		})
	}
	webDownloadProgress(type) {
		if(type=='progress') {
			args(1,sp,ep)
			if(ep<0) ep=0
			if(client) client.send("downloadProgress", url, "sp:$sp,ep:$ep");
		}
		if( type=='finish') {
			setCallback('webDownload', null)
		}
	}
}

class ProxyFileChunck {
	proxyData=class('ProxyData')
	fileChunckCall(path, &data, param) {
		param.inject(ref) not(ref) ref=System.localtime()
		proxyData.makeChunckFile(path, ref)
		proxyData.nextChunckSend(this, ref)
	}
	fileChunckOkCall(&uri, &data, param) {
		param.inject(name, ref)
		proxyData.chunckSendOk(this, name, ref)
	}
	fileSendEnd(name, ref) {
		
	}
}
