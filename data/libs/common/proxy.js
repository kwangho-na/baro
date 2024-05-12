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
class ProxyServer {
	start(name, port) {
		not(name) name='proxy'
		not(port) port=8093
		this.callback=call(func() {
			server=Baro.was(name)
			server.startServer(port, this.serverDispatch, "proxy", 2500);
		});
		return this.callback;
	}
	stop() {
		if(this.callback) {
			server
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
	serverDispatch(client, proxy) {
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
		print("PROXY SERVER DISPATCH START TYPE:$type", proxy)
		if(type=='login') {
			uid=data.trim();
			this.login(client, uid, proxy)			
		} else {
			name="${type}Call"
			fc=this.get(name)
			if(typeof(fc,"func")) {
				call(fc, this, client, proxy, line, data, props)
			}
			this.send(client, type, "$type not definded", "error:type not defined")
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
		 
		this.send(client, "apiCall", result, conf)
	}
}

class ProxyClient {
	workers=_arr('proxyWorkers')
	socket=null
	start(clientId, ip, port, timeout) {
		not(clientId) return print("장치아이디를 등록하세요");
		not(ip) ip='localhost';
		not(port) port=8093;
		not(timeout) timeout=2500;
		this.callback=call(func() {
			client=this;
			this.member(socket, Baro.socket(clientId))
			worker=Baro.worker(clientId)
			workers.add(worker)
			worker.start(client.clientProc, true, 100)
		})
	} 
	stop() {
		if( this.callback ) {
			this.callback.inject(worker, clientId, ip, port)
			print("client stop ", worker, clientId, ip, port)
			worker.stop()
			socket.close()
			this.callback=null
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
			this.clientRecv(socket, data);
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
	apiResult(uri, data, param) {
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
}