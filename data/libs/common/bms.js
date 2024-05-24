<func note="bms SERVICE function">
	@bms.start() {
		server=Baro.was("bms")
		server.startServer(8094, @bms.serverProcess, "bms", 2500);
	}
	/*
	LPCC uid=this->get("@uid");
	LPCC mapName=this->get("mapName");
	if(slen(uid)) {
		if(slen(mapName) ) {
			TreeNode* map=getTreeNode("map",mapName,false);
			if(map) {
				qDebug("%s map client close UID: %s", mapName, uid);
				StrVar* sv=map->gv(uid);
				if(sv) sv->reuse();
			}
		} else {
			StrVar* sv=uom.getInfo()->gv("proxyMaps");
			if(SVCHK('n',0)) {
				TreeNode* proxyMaps=(TreeNode*)SVO;
				qDebug("proxy client close UID: %s",uid);
				sv=proxyMaps->gv(uid);
				if(sv) sv->reuse();
			}
		}
	}
	*/
	@bms.serverProcess(clien) {
		data=client.recvData();
		if(typeof(data,'bool')) {
			client.close();
			return;
		}
		print("bms server recv == $data", client );
		data.ref();
		data.findPos('@@>');
		line=data.findPos("{",1,1);
		not(data.ch('{')) {
			return print("bms protocal error");
		}
		type=line.findPos('|').trim();
		size=line.findPos('|').trim();
		props=data.match();
		data.findPos("\r\n");
		print("$type => size:$size");
		msg='';
		bms=Cf.getObject("map","bms",true);
		if(type=='login') {
			uid=data.trim();
			prev=bms.get(uid);
			newCheck=false;
			if(prev) {
				print("prev==", prev.getValue());
				if(prev==client) {
					msg='error:already connect';
				} else {
					msg='ok:client reset';
					newCheck=true;
					
				}
			} else {
				msg='ok';
				print("login ok UID:$uid");
				newCheck=true;
			}	
			if(newCheck) {
				client.setValue('@uid', uid);
				client.setValue('mapName', 'bms');
				bms.set(uid, client);
			}
		} else {
			uid=client.getValue('@uid');
			msg='ok';
		}
		size=msg.size();
		packet="@@>$type|$size{uid:$uid}\n$msg";
		client.sendData(packet);
	}
</func>

<func note="bms client function">
	@bms.clientStart(deviceId, ip, port, timeout) {
		not(deviceId) return print("장치아이디를 등록하세요");
		not(ip) ip='58.230.162.173';
		not(port) port=8094;
		not(timeout) timeout=2500;
		socket=Baro.socket('bms');
		worker=Baro.worker('bms');
		worker.with(ip,port,timeout,socket, deviceId);
		worker.start(@bms.clientProc, true, 100)
		return worker;
	}
	@bms.clientProc() {
		this.inject(socket);
		not(socket) {
			return System.sleep(1000);
		}
		if(socket.isRead(500) ) {
			data=socket.recvData();
			print("bms recv data==$data"); 
			if(typeof(data,'bool')) {
				socket.close();
				print("bms read data error", this);
				return;
			}
			@bms.clientRead(socket, data);
		}
		not(socket.isConnect()) {
			this.inject(ip,port,timeout,deviceId);
			print("socket connect start", ip, port);
			if(socket.connect(ip,port,timeout)) {
				print("socket connect ok");
				tm=System.localtime();
				size=deviceId.size();
				if( socket.sendData("@@>login|$size{tm:$tm}\r\n$deviceId") ) {
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
	@bms.clientRead(socket, &data) {
		data.findPos('@@>');
		line=data.findPos("{",1,1);
		type=line.findPos('|').trim();
		size=line.findPos('|').trim();
		param=this.addNode("param").removeAll(true);
		param.parseJson(data.match(1));
		data.findPos("\n");
		print("client read data==$data");
	}
</func>

