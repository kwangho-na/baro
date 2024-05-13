c=_node()
c.id='id_ccc'
c.test() 
c[
	onInit() {
		xxx='test_c'
		workers=this.addArray('@workers')
	}
	clientProc(worker) {
		fn=Cf.funcNode('parent')
		funcVars=when(fn, fn.get())
		this.incrNum('ccc')
		print("xxxxxxx client xxxxxxx", this.ccc, client, xxx, funcVars)
	}
	test(ip, port) {
		// 선언된변수를 call 함수에 넣어준다... ip, port
		fn=call(func() {
				id='aaa'
				name='ccc'
				worker=Baro.worker(xxx)
				this.member(workers).add(worker)
				worker.start(this.clientProc, true, 10000)
				print("worker start", this, this.member(), xxx )
		});
		// 자동실행 처리 fn()
		this.member(callback, fn)
	}
]


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
class func {
	right(&str, sep, left) {
		a=str.findLast(sep);
		if( a.valid() ) {
			return a.right().trim();
		} else {
			return str;
		}
	}

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
	@proxy.serverStart() {
		was=class(Baro.was("proxy"), "ProxyServer")
		was.start()
		return was;
	}
}

class ProxyServer {
	callback=null
	start(port) {
		not(port) port=8093
		call(func() { 
			server=this
			server.startServer(port, this.clientDispatch, "proxy", 2500)
			print("proxy server started ", server)
			this.member("callback", Cf.funcNode())
		});
	}
	stop() {
		if( this.member("callback") ) {
			print("stop proxy server ", name, server)
			this.stop()
			callback.delete()
			this.member("callback", null)
		}
	}
	send(client, type, data, prop) {
		not(prop) {
			tm=System.localtime()
			prop="tm:$tm"
		}
		size=data.size()
		client.sendData("##>$type:$size{$prop}\r\n$data")
	}
	clientDispatch(client, proxy) {
		server=client.server()
		print("proxy dispatch ", client, server)
		if(client.isCall()) {
			print("clientDispatch 프록시 클라이언트 처리중")
			return;
		}
		data=client.recvData();
		if(typeof(data,'bool')) {
			client.close();
			return;
		}
		data.ref()
		data.findPos('##>')
		line=data.findPos("{",1,1) not(data.ch('{')) return print("PROXY SERVER protocal error $data")
		type=line.findPos(':').trim()
		size=line.findPos(':').trim()
		props=data.match()
		data.findPos("\r\n")
		print("PROXY SERVER DISPATCH START TYPE:$type", proxy)
		if(type=='login') {
			uid=data.trim();
			server.login(client, uid, proxy)			
		} else {
			name="${type}Call"
			fc=server.get(name)
			if(typeof(fc,"func")) {
				call(fc, server, client, proxy, line, data, props)
			} else {
				server.send(client, type, "$type not definded", "error:type not defined")
			}
		}
	}
	login(client, uid, proxy) {
		prev=proxy.get(uid);
		if(prev) {
			print("prev==", prev.getValue());
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
		this.send(client,"login", msg)
	}
	apiCall(client, proxy, &uri, &data, &props) {
		conf=client.config()
		param=conf.addNode("param").removeAll(true)
		if(props) param.parseJson(props)
		class("ProxyData").apiResult(uri, data, param)
		this.send(client, "apiCall", result, conf)
	}
}

class ProxyClient {
	socket=null
	callback=null
	workers=_arr('proxyWorkers')
	start(clientId, ip, port, timeout) {
		not(clientId) return print("장치아이디를 등록하세요");
		not(ip) ip='localhost';
		not(port) port=8093;
		not(timeout) timeout=2500;
		call(func() {
			self=this;
			socket=Baro.socket(clientId)
			worker=Baro.worker(clientId)
			worker.start(self.clientProc, true, 100)
			this.member("socket", socket)
			this.member("callback", Cf.funcNode())
			not(workers.find(worker)) workers.add(worker)
		})
	}
	stop() {
		if( this.member("callback") ) {
			callback.inject(worker, socket, clientId, ip, port)
			print("ProxyClient stop ", worker, clientId, ip, port)
			worker.close()
			socket.close()
			this.member("socket", null)
			this.member("callback", null)
		}
	}
	send(type, data, prop) {
		not(prop) {
			tm=System.localtime()
			prop="tm:$tm"
		}
		size=data.size()
		socket.sendData("##>$type:$size{$prop}\r\n$data")
	}
	clientProc() {
		not(socket) {
			print("client proc not valid socket ", clientId, ip, port, socket)
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
			tick=selft.var(errorTick)
			if(tick) {
				d=System.tick() - tick
				if(d>1000) {
					print("proxy client error tick==$d", self.var(error) )
					self.var(error, '')
					self.var(errorTick, 0)
				}
			} else {
				selft.var(errorTick, System.tick() )
			}
			return;
		}
		not(socket.isConnect()) {
			print("socket connect start", ip, port);
			if(socket.connect(ip,port,timeout)) { 
				if( self.send("login",clientId) ) {
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
		if(type=='api') {
			this.apiCall(line, data, param)
		} else {
			name="${type}Call"
			func=this.get(name)
			if(typeof(func,"func")) {
				call(func, this, line, data, param)
			} eles {
				this.send("error", "PROXY 타입오류 (타입:$type)")
			}
		}
	}
	apiCall(&uri, &data, param) {
		if( param.get("range")) {
			socket.setValue("Range", param.get("range"));
		} else {
			socket.socketClear("Range","rangeStart","rangeEnd");
		}
		result=class('ProxyData').apiResult(uri, data, param)
		socket.send(result)
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
		while(size=fp.size(), size.gt(0)) {
			data=fp.read(chunSize)
			not(data.size()) break;
			size-=data.size()
			num=lpad(idx++, 4)
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
	chunckSendOk(name, ref) {
		
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
		map=proxyData.member(sendMaps)
		map.set(name,"ok")
		pathTemp=Cf.val(System.path(),"/data/temp");
		Baro.file().delete("$pathTemp/$name")
		proxyData.nextChunckSend(this, ref)
	}
}
