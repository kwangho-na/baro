<func>
	app.cmdProc(type, data) {
		switch(type) {
		case write:
			this.cmdStart=true
		case read:
			c=data.ch(-1)
			if(c.eq('>')) {
				param=this.postParam;
				fc=when(param, param.finishCallback) not(typeof(fc,'func')) fc=this.finishCallback
				if(typeof(fc,'func') ) {
					fc()
				}
				if(param && param.isset(type) ) {
					if( param.type.eq('pandding') ) {
						param.result=this.result;
						next=param.index()+1
						cur=param.parentNode().child(next)
						if(cur.command) Cf.postEvent('gitCommand', cur);
					} else {
						print("git run finish type error [type==${param.type}] ");
					}
				}
				if(this.finishCallback) this.finishCallback=null;
			} else {
				if(this.cmdStart) {
					this.result=''
					this.cmdStart=false
				}
				this.appendText('result', data.utf8())
			}
		default:
		}
	}
	app.cmdCommand(type,param) {
		cmd = Baro.process("cmd")
		cmd.postParam = param;
		switch(type) {
		case cmdStart:
			if( cmd.is()) {
				print("cmd가 이미 실행중입니다");
				return;
			}
			cmd.run("cmd", @app.cmdProc)
			logClass('cmd').timeout()
		case cmdExec:
			not(param.command) return print("cmd 실행오류 컨멘드가 업습니다");
			cmd.write(param.command)
		case noteOpen:
			@note.notePage().open()
		case noteCommand:
			@note.noteCommand(param)
		default:
		}
	}
	
	app.initCmd() {
		node={}
		node.command='cd'
		Cf.getObject().set('@postEvent_cmd', @app.cmdCommand)
		Cf.postEvent('cmdStart', 'cmd', node)
		Cf.postEvent('cmdExec', 'cmd', node)
	}
</func>

	Cf.postEvent(); 
	cmd.addNode("args");
	cmd.callback = 
	
	Cf.postEvent("cmdStart", 'cmd', cmd)
