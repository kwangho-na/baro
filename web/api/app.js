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
	pythonUse(req, param, &uri) {
		path=conf('path.python')
		cmd=Baro.process('cmd')
		cmd.args.command="cd $path"
		logClass('cmd').timeout()
		Cf.postEvent('cmdExec', cmd)
		while(10) {
			System.sleep(100)
			out=logClass('cmd').timeout()
			if(out) {
				driveCheck(path, out)
				return out;
			}
		}
		return "cd $path 실행오류";
		
		driveCheck = func(&a, &b) {
			use(cmd)
			pythonDriver=a.value(0,2)
			c=b.ch()
			if(c.eq('#')) {
				b.incr()
				b.findPos('#')
			}
			curPath=b.findPos('>').trim()
			curDriver=curPath.value(0,2)
			if(curDirver!=pythonDriver ) {
				cmd.args.command=pythonDriver
				Cf.postEvent('cmdExec', cmd)
			}
			print("driverCheck ", cmd, curDriver, pythonDriver)
		};
	}
	pythonRunTest(req, param, &uri) { 
		cmd=Baro.process('cmd')
		cmd.args.command="python src/test.py"
		Cf.postEvent('cmdExec', cmd)
		logClass('cmd').timeout()
		while(250) {
			System.sleep(100)
			out=logClass('cmd').timeout()
			if(out) {
				c=out.ch(-1,true)
				if(c.eq('>')) return cmd.commandResult;
			}
		}
		return "pythonRunTest 실행오류";
	}
	pythonLibs(req, param, &uri) {
		cmd=Baro.process('cmd')
		cmd.args.command="python Lib/site-packages/pip freeze"
		Cf.postEvent('cmdExec', cmd)
		logClass('cmd').timeout()
		while(250) {
			System.sleep(100)
			out=logClass('cmd').timeout() 
			if(out) {
				c=out.ch(-1,true) 
				if(c.eq('>')) {
					return parse(cmd.commandResult);
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
		cmd=Baro.process('cmd')
		cmd.args.command="python Lib/site-packages/pip install $name"
		Cf.postEvent('cmdExec', cmd)
		logClass('cmd').timeout()
		while(500) {
			System.sleep(1000)
			out=logClass('cmd').timeout() 
			if(out) {
				c=out.ch(-1,true) 
				if(c.eq('>')) {
					param.result=cmd.commandResult
					return param;
				}
			}
		}
		param.error="pythonInstall 실행오류"
		return param;
	}
	pythonRun(req, param, &uri) {
		name=uri.trim()
		cmd=Baro.process('cmd')
		cmd.args.command="python Lib/site-packages/pip $name"
		Cf.postEvent('cmdExec', cmd)
		logClass('cmd').timeout()
		while(250) {
			System.sleep(100)
			out=logClass('cmd').timeout()
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
	
</api>
