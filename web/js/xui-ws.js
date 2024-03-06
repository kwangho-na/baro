xui.define("xui/ws", function(require, exports, module){
	"use strict";
	const wsList=[]
	const node={
		connect(id, peerId, host) {
			const idx=this.findId(id);
			if(idx!=-1) return wsList[idx]; 
			if(!host) host='localhost'; 
			const ws=new WebSocket("ws://"+host+":8092/chat")
			ws.onmessage = this.wsMsg;
			ws.onopen = this.wsOpen;
			ws.onclose= this.wsClose;
			ws.onerror= this.wsErr;
			const node={socket:ws, id, peerId}
			ws.node=node;
			wsList.push(ws);
			return ws;
		},
		findId(id) {
			let idx=0;
			for(const ws of wsList ) {
				if(ws.node && ws.node.id==id) return idx;
				idx++;
			}
			return -1;
		},
		websocket(id) {
			const idx=this.findId(id)
			return idx!=-1 ? wsList[idx]: null;
		},
		wsOpen(evt) {
			clog("websocket open =>", evt, this)
		},
		wsClose(evt) {
			clog("websocket close =>", evt)
			let idx=0;
			for(const ws of wsList ) {
				if(ws==this) {
					wsList.splice(idx,1)
					break;
				}
				idx++;
			}
		},
		wsMsg(evt) {
			clog("websocket msg =>", evt)
		},
		wsErr(evt) {
			clog("websocket error =>", evt)
		},
		sendMsg(id, msg) {
			const ws=this.websocket(id)
			if(ws) ws.send(msg);
		}
	} 
	node.wsList=wsList;
	return node;
});

