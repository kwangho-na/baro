<func note="웹데이터 처리">
	@web.result(&url, param) {
		web=Baro.web('result');
		if(typeof(param,'node')) {
			web[data]=@json.nodeStr(param);
		} else if(typeof(param,'string') && param) {
			web[data]=param;
		} else {
			web[data]='';
		}
		method='GET'
		if(web[data]) method='POST';
		web.result='';
		web.call(url, method, func(type,data) {
			if(type=='read') this.appendText('result',data);
		});
		return web.ref(result);
	}
</func>

<func note="웹프로세스 공통합수">
	@web.downloadAdd(url, savePath, fileName) {
		idx=Cf.rootNode().incrNum("webdownload_index");
		not(savePath) {
			savePath=conf('path.webDownloadPath');
			not(savePath) savePath='data/download';
		}
		not(fileName) fileName=rightVal(url,'/');
		n=idx%5;
		web=Baro.web("down-$n");
		web.addNode().with(url, savePath, downState:1);
	}
	@web.downloadStart() {
		while(n=0, n<5, n++ ) {
			web=Baro.web("down-$n")
			@web.downloadFile(web);
		}
	}
	@web.downloadClear() {
		arr=[];
		while(n=0, n<5, n++ ) {
			web=Baro.web("down-$n");
			arr.reuse();
			while(cur, web) {
				if(cur.downState) arr.add(cur);
			}
			while(cur, arr.reverse()) {
				web.remove(cur, true);
			}
		}
	}
	@web.downloadEndCheck() {
		while(n=0, n<5,  n++ ) {
			web=Baro.web("down-$n")
			if(web.isRun()) {
				if(web.downloadTick ) {
					dist=System.tick()-web.downloadTick;
					if(dist>5000) {
						print("web downlad stop URL:${web.url} dist:$dist");
						web.stop();
					}
				}
				return false;
			}
			while(cur, web) {
				if(cur.downState.eq(1,2) ) return true;
			}
		}
		return true;
	}
	@web.downloadFile(web) {
		node=null;
		while(cur, web) {
			if(cur.downState==1 ) {
				node=cur;
				cur.downState=2;
				break;
			}
		}
		not(node) return;
		node.inject(url, savePath, fileName);
		not(fileName) {
			node.downState=9;
			return @web.downloadFile(web);
		}
		web.currentNode=node;
		web.download(url, "$savePath/$fileName", "GET", @web.downloadProcess );
	}
	@web.downloadProcess(type,data) {
		if(type=='process') {
			return;
		}
		node=this.currentNode;
		if(type=='finish') {
			node.downState=3;
			return @web.downloadFile(this);
		}
		if(type=='error') {
			node.downState=9;
			return print("다운로드오류: ${node}");
		}
	}
	
</func>

