class cmd {	
	initClass() {
		@cmdList=this.dataArray("cmd.cmdList")
		@proc=Baro.process("cmd")
		@status=""
		this.start()
	}
	start(params) {
		if( proc.run() ) {
			proc.close()
		}
		proc.run("cmd", this.cmdProc)
	}
	cmdProc(type,data) {
		if(type=='read') {
			this.appendText('result', data);
			c=data.ch(-1,true);
			if(c=='>') {
				@status="stay"
				this.parseResult(self.ref(result));
				this.cmdRun()
			}
		}
	}
	cmdAdd(cmd, run) {
		cmdList.add(cmd)
		if(run) this.cmdRun()
	}
	cmdRun() {
		cmd=cmdList.pop()
		if(cmd) {
			@status="start"
			this.set("result","")
			proc.write(cmd);
		} else {
			@status="finish"
		}
	}
	parseResult(&s) {
		print("parse result == $s", this.member() );
	}
}

class programRun {
	run(name, program) {
		not(name) name="app"
		self=this
		cb=call(func() {
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