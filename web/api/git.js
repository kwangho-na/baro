<api>
	gitTest(req,param,&uri) {
		git=@git.postEventAdd()
		return "git => $git"
	}
	moveFile(req,param,&uri) {
		name=uri.trim()
		pathGit=conf("git#path.kwangho-na/na");
		pathApp=System.path()
		src=fileRead("$pathApp/$name");
		fileWrite("$pathGit/$name", src)
		return "$pathApp/$name => $pathGit/$name";
	}
	
	gitPush(req,param,&uri) {
		git=Baro.process('git')
		fc=@git.cbPush
		pandding=object('git.pandding').removeAll(true)
		pandding.addNode().with(command:'add .', type:'pandding')
		pandding.addNode().with(command:'commit -m "commit test"', type:'pandding');
		pandding.addNode().with(command:'push', finishCallback:fc)
		Cf.postEvent("gitCommand", 'gitEvent', pandding.child(0)); 
		ss=''
		while(cur, pandding, n) {
			if(n) ss.add("\r\n")
			ss.add(cur.result)
		}
		return ss;
	}
	gitCommand(req,param,&uri) {
		git=Baro.process('git')
		git.with(req, param)
		type=uri.findPos('/').trim()
		print("xxxxxx git command xxxxxxx", type);
		switch(type) {
		case logs:
			param.command='log --graph --oneline';
			git.finishCallback=@git.cbLogs
		case log:
			param.command='log';
			git.finishCallback=@git.cbLog
		case files:
			param.command='ls-files --stage'
			git.finishCallback=@git.cbFiles
		case status:
			param.command='status -z -uall'
			git.finishCallback=@git.cbStatus
		case tree:
			key=uri.findPos('/').trim()
			mode=uri.findPos('/').trim()
			not(key) key='main';
			if(mode=='all') {
				param.command="ls-tree -r $key"
			} else {
				param.command="ls-tree $key"
			}
			git.finishCallback=@git.cbTrees
		case addAll:
			param.command='add .';
		case config:
			param.command='git config --list';
		default:
		}
		print("git $cmd start")
		Cf.postEvent("gitCommand", 'git', param); 
		n=0;
		while(250) {
			System.sleep(150)
			if(param.finished) {
				break;
			}
			n++;
		}
		return param; 
	}
	 
	gitDownFile(req, param, &uri) {
		name=uri.trim();
		w=Baro.web('down')
		w.result=''
		w.call("https://raw.githubusercontent.com/kwangho-na/baro/na/$name", func(type,data) {
			if(type=='read') this.appendText('result',data)
		})
		path=System.path();
		fileWrite("$path/$name", w.result)
		return "$path/$name"
	}
	
</api>

<func>
	@git.runProc(type,data) {
		switch(type) {
		case start: this.result=''
		case read: this.appendText('result', data)
		case finish:
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
		default:
		}
	}
	@git.postEventFuncs(type,param) {
		switch(type) {
		case gitCommand: 
			git=Baro.process('git')
			git.postParam=param;
			git.run("git ${param.command}", @git.runProc)
		default:
		}
	}
	@git.postEventAdd() {
		git=Baro.process('git')
		not(git.var(workPath)) git.path(conf('git#path.kwangho-na/na'))
		Cf.getObject().set('@postEvent_git', @git.postEventFuncs);
		return git;
	}
	@git.cbLogs() {
		this.inject(req,param)
		s=this.ref(result);
		while(s.valid()) {
			line=s.findPos("\n");
			not(line.ch()) break;
			not(line.ch('*')) continue;
			line.incr().ch()
			key=line.move()
			msg=line.trim()
			param.addNode().with(key,msg)
		}
		not(param.childCount()) param.message='nologs'; 
		param.finished=true;
	}
	@git.cbLog() {
		this.inject(req,param)
		s=this.ref(result);
		s.findPos('commit ')
		while(s.valid()) {
			sha=s.move() s.findPos('Author:')
			author=s.findPos("\n").trim() s.findPos('Date:')
			date=s.findPos("\n").trim() 
			comment=s.findPos('commit ').trim()
			param.addNode().with(sha, author, date, comment)
		}
		not(param.childCount()) param.message='nolog'; 
		param.finished=true;
	}
	@git.cbFiles() {
		this.inject(req,param)
		s=this.ref(result);
		while(s.valid()) {
			line=s.findPos("\n");
			not(line.ch()) break;
			num=line.findPos(" \t",4).trim()
			sha=line.findPos(" \t",4).trim()
			stat=line.findPos(" \t",4).trim()
			name=line.trim()
			param.addNode().with(num,sha,stat,name)
		}
		not(param.childCount()) param.message='nofiles'; 
		param.finished=true;
		print("git files finished ok ", param)
	}
	@git.cbStatus() {
		this.inject(req,param)
		s=this.ref(result);
		print("git command status >> ", req, param, s)
		while(s.valid()) {
			line=s.findPos("\n");
			not(line.ch()) break;
			type=line.findPos(" \t",4).trim()
			name=line.trim()
			param.addNode().with(type,name)
		} 
		not(param.childCount()) param.message='nochange';
		param.finished=true;
		print("git status finished ok ", param)
	}
	@git.cbTrees() {
		this.inject(req,param)
		s=this.ref(result);
		print("git command status >> ", req, param, s)
		while(s.valid()) {
			line=s.findPos("\n");
			not(line.ch()) break;
			num=line.findPos(" \t",4).trim()
			type=line.findPos(" \t",4).trim()
			sha=line.findPos(" \t",4).trim()
			name=line.findPos(" \t",4).trim()
			param.addNode().with(num, type, sha, name)
		}
		param.finished=true;
		print("git tree finished ok ", param)
	}
	@git.cbPush() {
		this.inject(req,param)
		s=this.ref(result);
		print("git command push >> ", req, param) 
		param.finished=true;
	}
</func>