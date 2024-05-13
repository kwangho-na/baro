class cmd {	
	proc=null
	start(name) {
		not(name) name='cmd'
		call(func() {
			self=this 
			proc=Baro.process('cmd')
			proc.run('cmd', self.cmdProc)
			this.member("callback", Cf.funcNode())
			this.member("proc", proc)
			this.member("cmdList", self.addArray('@cmdList'))
		})
	}
	cmdAdd(cmd) {
		state=this.member("state");
		cmdList.add(cmd)
	}
	cmdRun() {
		not(this.member("proc")) return print("cmd 실행오류 프로세스가 시작되지 않았습니다");
		cmd=cmdList.pop()
		if(cmd) {
			this.member("state", "start")
			proc.write(cmd);
		} else {
			this.member("state", "finish")
		}
	}
	cmdProc(type,data) {
		print("cmd proce", type, data)
		if(type=='read') {
			self.appendText('result', data);
			c=data.ch(-1,true);
			if(c=='>') {
				self.member("state", "stay")
				self.parseResult(self.ref(result));
				self.cmdRun()
			}
		}
	}
	parseResult(&s) {
		print("parse result == $s", this.member() );
	}
}
