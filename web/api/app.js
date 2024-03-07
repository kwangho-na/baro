<api>
	components(req,param,&uri) {
		ss='';
		path=webRoot();		
		while(uri.valid()) {
			name=uri.findPos("/").trim();
			not(name) break;
			fullPath="$path/template/components/${name}.html"			
			not(isFile(fullPath)) return "$fullPath 파일을 찾을수 없습니다"
			src=fileRead(fullPath)
			ss.add(parse(src,name))
		}
		return ss;
		parse=func(&s, name) {
			use(param)
			ss='';
			s.findPos('<def ',0,1)
			src=s.match('<def ','</def>')
			if(typeof(src,'bool')) return;
			name=src.findPos('>').trim()
			ss.add("<def $name>")
			ss.add(parseScript(src,param));
			ss.add("</def>");
			if(param.all) ss.add(@template.parse(s,"",param))
			return ss;
		};
		parseScript = func(&s, param) {
			ss='', param.actions='', param.computed='', param.src='';
			while(s.valid()) {
				left=s.findPos('<script',0,1)
				ss.add(left);
				not(s.ch()) break;
				src=s.match('<script', '</script>');
				if(typeof(src,'bool')) break;
				prop=src.findPos('>').trim();
				ss.add(parseSrc(src, param, prop));
			}
			return ss;
		};
		parseSrc = func(&s, param, prop) {
			ss='';
			while(s.valid()) {
				c=s.ch();
				not(c) break;
				if(c.eq(',')) {
					s.incr();
					continue;
				}
				if(c.eq('/')) {
					c=s.ch(1)
					if(c.eq('/')) s.findPos("\n")
					else s.match();
					continue;
				}
				name=s.move()
				c=s.ch()
				if(s.start('=>', true)) {
					if( s.ch('{') ) {
						a=s.match(1)
						param.appendText('computed', "$name: ()=>{$a},");
					} else {
						a=s.findPos("\n").trim();
						param.appendText('computed', "$name: ()=>$a,");
					}
					continue;
				}
				fparam='', fsrc='';
				if(c.eq('=')) {
					c=s.incr().ch()
					if(c.eq('(')) {
						fparam=s.match();
						s.start('=>',true);
					} else if(lineCheck(s,'=>')) {
						fparam=s.findPos("=>").trim();
					}
					c=s.ch();
					not(c.eq('{')) {
						a=s.findPos("\n").trim();
						fsrc="return $a";
					}
				} else if(c.eq('(')) {
					fparam=s.match();
				} 				
				not( prop.eq('actions')) prop='src'
				not( fsrc ) {
					c=s.ch();
					not(c.eq('{')) {
						param.appendText(prop,"// $name 함수 시작오류");
						break;
					}
					fsrc=s.match(1)
				}
				param.appendText(prop, "${name}(${fparam}){${fsrc}},");
			}
			if(param.computed) {
				ss.add("<script computed>${param.computed}</script>");
			} 
			if(param.actions) {
				ss.add("<script actions>${param.actions}</script>");
			} 
			if(param.src) {
				ss.add("<script>${param.src}</script>");
			}
			return ss;
		};
	}
	iconList(req, param, &uri) {
		path=webRoot()
		fo=Baro.file()
		fo.var(nameFilter, "*.png")
		fo.list("$path/images/icons",
		func(info){
			while(info.next()) {
				info.inject(type,name)
				if(type=='folder') continue
				param.addNode().with(name)
			}
		})
		return param;
	}
	icon(req, param, &uri) {
		path=webRoot()
		name=uri.trim()
		not( req.sendFile("$path/images/icons/$name") ) req.close()
		return;
	}
	parsePython(req, param, &uri) {
		src=param.src.escape()
		print("parse python src==$src")
		return src;
	}
	pythonUse(req, param, &uri) {
		path=conf('path.python')
		python=Baro.process('python')
		python.args.command="cd $path"
		logClass('python').timeout()
		Cf.postEvent('pythonExec', python)
		while(10) {
			System.sleep(100)
			out=logClass('python').timeout()
			if(out) {
				driveCheck(path, out)
				return out;
			}
		}
		return "cd $path 실행오류";
		
		driveCheck = func(&a, &b) {
			use(python)
			pythonDriver=a.value(0,2)
			c=b.ch()
			if(c.eq('#')) {
				b.incr()
				b.findPos('#')
			}
			curPath=b.findPos('>').trim()
			curDriver=curPath.value(0,2)
			if(curDirver!=pythonDriver ) {
				python.args.command=pythonDriver
				Cf.postEvent('pythonExec', python)
			}
			print("driverCheck ", python, curDriver, pythonDriver)
		};
	}
	pythonRunTest(req, param, &uri) { 
		python=Baro.process('python')
		param.command="python src/test.py"
		Cf.postEvent('python', 'pythonExec', param)
		logClass('python').timeout()
		while(250) {
			System.sleep(100)
			out=logClass('python').timeout()
			if(out) {
				c=out.ch(-1,true)
				if(c.eq('>')) return param.result;
			}
		}
		return "pythonRunTest 실행오류";
	}
	pythonLibs(req, param, &uri) {
		python=Baro.process('python')
		python.args.command="python Lib/site-packages/pip freeze"
		Cf.postEvent('pythonExec', python)
		logClass('python').timeout()
		while(250) {
			System.sleep(100)
			out=logClass('python').timeout() 
			if(out) {
				c=out.ch(-1,true) 
				if(c.eq('>')) {
					return parse(python.commandResult);
				}
			}
		}
		param.error="pythonLibs 실행오류"
		return param;
		
		parse=func(&s) {
			use(param)
			while(s.valid()) {
				line=s.findPos("\n");
				not(line.find('==')) continue;
				name=line.findPos('==').trim()
				version=line.trim();
				param.addNode().with(name,version)
			}
			return param
		}
	}
	pythonInstall(req, param, &uri) {
		name=uri.trim()
		python=Baro.process('python')
		python.args.command="python Lib/site-packages/pip install $name"
		Cf.postEvent('pythonExec', python)
		logClass('python').timeout()
		while(500) {
			System.sleep(1000)
			out=logClass('python').timeout() 
			if(out) {
				c=out.ch(-1,true) 
				if(c.eq('>')) {
					param.result=python.commandResult
					return param;
				}
			}
		}
		param.error="pythonInstall 실행오류"
		return param;
	}
	pythonRun(req, param, &uri) {
		name=uri.trim()
		python=Baro.process('python')
		python.args.command="python Lib/site-packages/pip $name"
		Cf.postEvent('pythonExec', python)
		logClass('python').timeout()
		while(250) {
			System.sleep(100)
			out=logClass('python').timeout()
			if(out) {
				c=out.ch(-1,true)
				if(c.eq('>')) return out;
			}
		}
		return "pythonLibs 실행오류";
	}
	readBase64(req, param, &uri) {
		fnm=uri.trim()
		not(isFile(fnm)) return print("$fnm 파일을 읽을수 없습니다")
		data=Baro.file().readBase64(fnm);
		return data;
		
	}
	readFile(req, param, &uri) {
		fnm=uri.trim()
		not(isFile(fnm)) return print("$fnm 파일을 읽을수 없습니다")
		return fileRead(fnm)
	}
	
	screenRectPos(req, param, &uri) {
		rc=@app.screenRectPos()
		return "screen rect $rc"
	}
</api>


<func>
	@app.reloadApi(name) {
		fo=Baro.file("api")
		path=webRoot()
		filePath="$path/api/${name}.js"
		serviceNode=Cf.getObject("api", name, true);
		modifyTm=fo.modifyDate(filePath);
		not(modifyTm.eq(serviceNode.lastModifyTm)) { 
			@api.addServiceFunc(serviceNode, fileRead(filePath));
			serviceNode.lastModifyTm=modifyTm;
		}
	}
	@app.screenRectPos(pos) {
		not(pos) pos=System.info('cursor')
		rcScreen=null
		cnt=System.info('screenCount')
		while(n=0, n<cnt, n++) {
			rc=System.info('screenRect', n)
			if(rc.contains(pos)) return rc;
		}
		return;
	}
	@app.cmdPanddingNode(pid) {
		if(@app.cmdRunCheck(pid)) return;
		node=object("pandding.$pid").removeAll()
		node.var(tag, pid)
		return node;
	}
	@app.cmdPythonStart() {
		p=Baro.process('python')
		p.path(conf('path.python'))
		not(p.run()) {
			p.run('cmd', @app.cmdProc)
			Cf.postEvent('python', @app.cmdPostEvent);
		}
	}
	@app.cmdFinishFunc() {
		cmd=this;
		param=cmd.postParam;
		print("cmd finished ", cmd, param)
	}
	@app.cmdRunCheck(pid, reset) {
		while(cur, object("pandding.$pid")) {
			not(cur.startTick) continue;
			not(cur.finishFlag) return true;
		}
		if(reset) object("pandding.$pid").removeAll()
		return false;
	}
	@app.cmdParam(pid, command, finishCallback ) {
		finishFlag=false;
		node = object("pandding.$pid")
		param = node.addNode().with(pid, command, finishCallback, finishFlag)
		if( @app.cmdRunCheck(pid)) {
			param.type = 'padding'
		} else if(finishCallback) {
			Cf.postEvent(pid,"cmdExec", param);
		}
		return param;
	}
	@app.cmdPostEvent(type,param) {
		param.inject(pid, command)
		cmd = Baro.process(pid)
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
			not(command) return print("cmd 실행오류 컨멘드가 업습니다");
			param.startTick=System.tick()
			cmd.write(command)
		default:
		}
	}
	@app.cmdProc(type, data) {
		switch(type) {
		case write:
			this.cmdStart=true
		case read:
			c=data.ch(-1)
			if(c.eq('>')) {
				param=this.postParam;
				fc=when(param, param.finishCallback) not(typeof(fc,'func')) fc=this.finishCallback
				if(typeof(fc,'func') ) {
					fc(param)
				}
				if(param && param.isset(type) ) {
					if( param.type.eq('pandding') ) {
						param.result=this.result;
						next=param.index()+1
						cur=param.parentNode().child(next)
						if(cur.command) Cf.postEvent('cmd','cmdExec', cur);
					}
				}
				if(param) param.finishFlag=true;
				this.postParam=null
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
</func>