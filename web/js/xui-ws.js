xui.define("xui/ws", function(require, exports, module) {
	"use strict";
	const wsMap={}
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
	const send = (id, msg) => {
		const ws=this.websocket(id)
		if(ws && ws.readyState==1 ) {
			ws.send(msg);
		}
	}
	const sendMessage = (id, msg) => {
		const ws=this.websocket(id)
		if(ws && ws.readyState==1 ) {
			ws.send(msg);
		}
	}
	const parseMessage = (ws, data) => {
		
	}
	return {wsMap, connect, websocket, websocketId, send, parseMessage };
});
