<func note="interface function">
	@proc.run(type, data) {
		print("$type >> $data")
	}
	@proc.cmd(type,data) {
		if(type=='read') {
			if(typeof(this.callback,'func')) {
				this.callback(data)
			}
			logWriter('cmd').appendLog(data); 
			return;
		}
		if(type=='finish') {
			date=System.date('yyyyMMdd hh:mm:ss');
			logWriter('cmd').appendLog("@@> cmd finished $date");
		}
	}
	@proc.cmdStart(type,data) {
		p=Baro.process('cmd');
		p.run('cmd', @proc.cmd);
		logClass('cmd').timeout();
		return p;
	}
	@proc.cmdAdd(str) {
		cmd=Baro.process('cmd');
		not(cmd.is()) cmd.run('cmd', @proc.cmdProc);
		not(cmd.commands) cmd.commands=cmd.newArray();
		not(cmd.procStatus) cmd.procStatus='stay';
		if(cmd.procStatus=='stay') {
			cmd.write(str);
		} else {
			cmd.commands.add(str);
		}
		return cmd;
	}
	@proc.cmdReset() {
		cmd=Baro.process('cmd');
		cmd.result='';
		cmd.procStatus='stay';
		cmd.commands.reuse();
	}
	@proc.cmdResult(reset) {
		cmd=Baro.process('cmd');
		rst=cmd.result;
		if(reset) cmd.result='';
		return rst;
	}
	@proc.cmdProc(type,data) {
		print("$type >>", this);
		if(type=='write') {
			this.procStatus='run';
			return;
		}
		if(type=='read') {
			this.appendText('result', data);
			c=data.ch(-1,true);
			if(c=='>') {
				str=this.commands.pop();
				this.procStatus='stay';
				if(str) {
					@proc.cmdAdd(str);
				}
			} else {
				this.procStatus='read';
			}
		}
	}
	
	
	@proc.java(type,data) {
		if(type=='read') logWriter('java').appendLog(data);
	}
	@proc.run(type,data) {
		if(type=='read') logWriter('run').appendLog(data);
	}
	@proc.web(type,data) {
		if(type=='read') logWriter('web').appendLog(data);
		if(type=='error') logWriter('web').appendLog("@@> error : $data");
		if(type=='finish') logWriter('web').appendLog("\n\n@@> finish ${this.url}");
	}
	@proc.poseEvent(type, param) {
		if(type=='rdStart') {
			param.inject(quality)
			print("xxxxxxxxx rd start xxxxxxxxxxxx", param);
			not(quality) quality='40';
			rd=object('object.rdInfo')	
			path=System.path()
			proc=Baro.process('python')
			if(proc.is()) {
				rd.error="$rd 데스크탑 캡쳐 프로세스가 실행중입니다";
				return;
			}
			rc=System.info('screenRect',0)
			rc.inject(x,y,w,h)
			pythonPath=conf('python.path')
			sourcePath=conf('python.sourcePath') 
			logPath=logClass('python').member(logFileName)
			outputPath=logClass('pythonOutput').member(logFileName)
			imagePath=rd.imagePath;
			not(imagePath) {
				imagePath="${path}/pages/web/images/capture"
				rd.imagePath=imagePath;
			}
			rd.rdStatus='start';
			print("rd==$rd python $sourcePath/sc002.py --log $logPath --output $outputPath --quality $quality --x $x --y $y --w $w --h $h --image $imagePath");
			
			proc.run("python $sourcePath/sc002.py --log $logPath --output $outputPath --quality $quality --x $x --y $y --w $w --h $h --image $imagePath", @proc.run, 0, pythonPath);
		}
	}
</func>

