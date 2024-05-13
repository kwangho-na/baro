class cmd {	
	proc=null
	cmdList=null
	state=""
	start(name) {
		not(name) name='cmd'
		call(func() {
			proc=Baro.process(name)
			if(proc.run()) proc.close()
			self=this 
			proc.run(name, self.cmdProc)
			this.member("proc", proc)
			this.member("cmdList", self.addArray('@cmdList'))
		})
	}
	cmdAdd(cmd, run) {
		cmdList.add(cmd)
		if(run) this.cmdRun()
	}
	cmdRun() {
		not(this.member("proc")) return print("cmd 실행오류 프로세스가 시작되지 않았습니다");
		state=this.member("state");
		if(state=='start') {
			print("run skip cmd started ", cmdList);
			return;
		}
		cmd=cmdList.pop()
		if(cmd) {
			this.member("state", "start")
			this.set("result","")
			proc.write(cmd);
		} else {
			this.member("state", "finish")
		}
	}
	cmdProc(type,data) {
		if(type=='read') {
			self.appendText('result', data);
			c=data.ch(-1,true);
			if(c=='>') {
				result=self.get('result').utf8()
				self.member("state", "stay")
				self.parseResult(result);
				self.cmdRun()
			}
		}
	}
	parseResult(&s) {
		print("parse result == $s", this.member() );
	}
}

class programRun {
	run(name, program) {
		not(name) name="app"
		cb=call(func() {
			self=this
			proc=Baro.process(name)
			proc.run(program, self.programProc)
		})
		return cb
	}
	programProc(type, data) {
		print("programProc >> ", type, data)
		if(type=='finish') {
			print("xxxx finish xxxx", self, this, name, program)
		}
	}
	explore(path, files) {
		System.openExplore(path, files)
	}
	editor(path) {
		program='C:\Program Files\Notepad++\notepad++.exe'
		if(path) program.add(#[ "${path}"])
		return this.run('notepad', program)
	}
}