<func note="웹페이지 합수">
	loadWebPage(filePath) {
		not(filePath) {
			path=System.path();
			filePath="$path/pages/web/webPageMaps.html";
		}
		map=Baro.was().urlMap();
		print("loadWebPage filePath==$filePath map:$map");
		return @was.parseWebPageMaps(map, fileRead(filePath));		
	}
	@was.pageWatcher() {
		worker=Baro.worker('pageWatcher');
		worker.start(@was.templateWatcherProc, true, 2500);
	}
	@was.reloadPage() {
		map=Cf.getObject("object","templateWatch", true);
		was=Baro.was();
		not(was.templatePath) {
			path=webRoot()
			was.templatePath="$path/template";
		}
		@was.modifyFileCheck(map,was.templatePath);
	}
	@was.templateWatcherProc(startPath) {
		was=Baro.was();
		if(startPath) {
			not(startPath.eq(was.templatePath)) {
				was.templatePath=startPath;
			}
		} else {
			startPath=was.templatePath;
			not(startPath) {
				path=webRoot()
				startPath="$path/template";
				was.templatePath=startPath;
			}
		}
		map=Cf.getObject("object","templateWatch", true);
		@was.modifyFileCheck(map,startPath);
	}
	@was.modifyFileCheck(map,path,pathLen) {
		fo=Baro.file('watch');
		not(pathLen) pathLen=path.size()+1;
		fo.list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath, size, modifyDt, createDt)
				if(type=='folder') {
					@was.modifyFileCheck(map, fullPath, pathLen);
					continue;
				}
				id=fullPath.value(pathLen);
				node=map.get(id);
				if(node) {
					not(modifyDt.eq(node.modifyDt)) {
						print("was file modify: $fullPath");
						loadWebPage(fullPath);
						node.modifyDt=modifyDt;
					}
				} else {
					loadWebPage(fullPath);
					node=map.addNode(id);
					node.with(name, fullPath, size, modifyDt);
				}	
			}
		});
	}
	@was.templatePage(name) {
		return @was.templateParse(object("src.template").get(name));
	}
	@was.parseWebPageMaps(map, &s) {		 
		path=System.path();
		while(s.valid()) {
			c=s.ch();
			if(c.eq('/')) {
				cc=s.ch(1);
				if(cc.eq('/')) {
					s.findPos("\n");
				} else if(cc.eq('*')) {
					s.match();
				}
				continue;
			}
			not(c.eq('<')) break;
			if(s.start('<!--')) {
				s.match('<!--', '-->');
				continue;
			}
			sp=s.cur();	
			ch=s.incr().next().ch();
			while(ch.eq('-')) ch=s.next().ch();
			tag=s.trim(sp+1, s.cur())
			s.pos(sp);
			ss=s.match("<$tag", "</$tag>");
			if(typeof(ss,'bool')) {
				return print("web page parse match error tag:$tag props:$props");
			}
			props=ss.findPos('>');
			name=propVal(props,'name');
			if(tag=='page') {
				url=propVal(props,'url');
				not(url) continue;
				not(name) name='main'
				src=tagBody(ss, 'src');
				template=tagBody(ss, 'template');
				fnm="@WebPage.${name}";
				if(template) {
					conf("src#pageTemplate.$name", template, true)
					if(template.find('@{')) {
						source=#[
							${src} 
							pageTemplate=conf("src#pageTemplate.${name}")
							req.send(@pages.pageSource(pageTemplate))
						]
					} else {
						source=#[
							${src} 
							pageTemplate=conf("src#pageTemplate.${name}")
							req.send(@was.templateParse(pageTemplate))
						]
					}
				} else {
					source=src;
				}
				call("${fnm}(req, param) { ${source} }");
				map[$url]=call(fnm); 
			} else if(tag=='component') {
				src=tagBody(ss, 'script');
				template=tagBody(ss, 'template');
				node=object("component.${name}")
				node.set('template', template);
				node.set('script', src);
			} else if(tag=='style') {
				fileAppend("$path/pages/web/css/${name}.css", ss);
			} else {
				object("src.$tag").set(name, ss);
			}
		}
		return map;
	}
	@was.templateValue(&s,fn,node) {
		if(s.find('.')) {
			tag=s.findPos('.').trim();
		} else {
			tag='template';
		}
		name=s.trim();
		not(name) return;
		return @was.templateParse(object("src.$tag").get(name),fn);
	}
	@was.varValue(&s,varName,node) { 
		use(fn);
		ch=s.ch();
		if(fn && ch ) {
			val='';
			if(ch.eq()) {
				val=s.match();
			} else {
				name=s.move();
				if(node && node.isset(name) ) {
					val=node.get(name)
					if(val.ch('@')) {
						v=val.trim(1);
						val="store.$v";
					}
				} else if(typeof(name,'num')) {
					val=name
				} else {
					val=fn.get(name)
				}
			}
			if(varName) Cf.funcNode('parent').set(varName, val);
		} else {
			print("var value error s==$s", fn);
		}
		return s.cur();
	}	 
	@was.varCheck(&s,node) {
		use(fn);
		if(isFunc(s)) {
			fnm=s.move().lower();
			param=s.match();
			if(fnm.eq('not')) {
				@was.varValue(param,'val');
				return when(val,false,true);
			}
			return false;
		}
		oper=0;
		ok=false,a='',b='';
		s.pos(@was.varValue(s,'a'));
		c=s.ch();
		if(c.eq('=','!','<','>')) {
			c1=s.incr().ch();
			if(c1.eq('=')) {
				c=s.incr().ch();
				if(c.eq('=')) oper=1;
				else if(c.eq('!')) oper=2;
				else if(c.eq('<')) oper=5;
				else if(c.eq('>')) oper=6;
			} else {
				c=c1;
				if(c.eq('=')) oper=1;
				else if(c.eq('<')) oper=3;
				else if(c.eq('>')) oper=4;
			}
		} 
		if(oper) {
			s.pos(@was.varValue(s,'b'));
			switch(oper) {
			case 1: ok=a.eq(b);
			case 2: ok=a.ne(b);
			case 3: ok=a.lt(b);
			case 4: ok=a.gt(b);
			case 5: ok=a.le(b);
			case 6: ok=a.ge(b);
			}
		} else {
			ok=a;
		}
		return ok;
	}
	@was.templateParse(&s, fn) {
		not(fn) fn=Cf.funcNode('parent'); 
		rst='';
		print("xxx template parse start xxx");
		while(s.valid()) {
			left=s.findPos('#{',0,1);
			rst.add(left);
			not(s.ch()) break;
			k=s.incr().match(1);
			if(typeof(k,'bool')) break;
			ch=k.ch();
			not(ch) continue;
			if(ch.eq('[')) { 
				rst.add(@was.templateValue(k.match(),fn) );
			} else {
				if(k.find('?')) {
					ok=false;
					while(k.valid()) {
						if(k.find('?')) {
							ok=@was.varCheck(k.findPos('?'));
							val=keyVal();
						} else {
							not(ok) ok=true;
							val=keyVal();
						}
						if(ok) {
							rst.add(val);
							break;
						}
						if(k.ch(':')) {
							k.incr();
						} else {
							print("template parse check break");
							break;
						}
					}
				} else {
					@was.varValue(k,'val');
					rst.add(val);
				}
			}
		}
		return rst;
		keyVal=func() {
			c=k.ch(), v='';
			if(c.eq()) {
				v=k.match();
			} else if(c.eq('<')) {
				sp=k.cur();
				tag=k.incr().move();
				k.pos(sp);
				str=k.match("<$tag","</$tag>");
				if(ok) {
					if(typeof(str,'bool')) {
						v="$tag not match";
					} else {
						if(tag.eq('text')) {
							str.findPos('>');
							v=str;
						} else {
							v=@was.templateParse("<$tag$str</$tag>", fn);
						}
					}
				}
			} else if(c.eq('[')) { 
				name=k.match();
				if(ok) {
					v=@was.templateValue(name,fn);
				}
			} else {
				ep=@was.varValue(k,'v');
				k.pos(ep);
				k.findPos(':',1,1)
			}
			return v;
		};
	}
	@was.varContent(&s,varName,node,skip) { 
		use(fn);
		not(fn) return print("varContent funcNode is null !!!");
		pfn=Cf.funcNode('parent');
		ch=s.ch()
		if(varName) pfn.set(varName, '');
		if(skip) {
			ss=s.find(':');
			ep=ss.size();
		} else {
			ep=s.end()
		}
		if(ch) {
			if(ch.eq('*')) {
				// @{*load=>/api/pages/xxx } 형태 함수변수부터 확인
				name=s.incr().move();
				if(s.start('::',true)) {
					param=s.trim(s.cur(),ep,true)
					if(name.eq('cmd','command')) {
						s=node.ref("$param");
						not(s) {
							if(varName) pfn.set(varName, '');
							return ep;
						}
						name=s.move();
						param=s.trim();
					}
					print(">> ", name, param);
					if(name.eq('load')) {
						val=@api.call(param);
					} else if(name.eq('read')) {
						path=Baro.was().get('templatePath');
						val=fileRead("$path/$param");
					} else if(name.eq('clip')) {
						if(param.find('.')) {
							val=conf("clip#$param");
						} else {
							val=conf("clip.$param");
						}
					} else if(name.eq('conf')) {
						val=conf(param);
					} else if(name.eq('ref')) {
						reqParam=fn.get("_reqParam")
						param.split('.').inject(a,b)
						obj=reqParam.get(a);
						
					} else {
						val='';
						print("$name 은 정의되지 않은 외부변수 타입입니다");
					}
				} else {
					val=fn.get(name)
				}
				not(skip) {
					if(val) {
						if(val.find('@{') || val.find('@@') ) {
							val=@was.content(val,fn,node); 
						}
					} else if(s.ch('|')) {
						val=s.incr().trim();						 
					}
				}
				if(varName) pfn.set(varName, val);
				return ep;
			}
			if(ch.eq()) {
				// @{"test=@{b}"}
				val=s.match();
			} else {
				val=''
				name=s.move();
				if(name.eq('not','set')) {
					// (ex) @{not a=1}
					ch=s.ch();
					not(node) {
						s.pos(ep);
						return;
					}
					code=s.move();
					ch=s.ch();
					if(ch.eq('=',':')) {
						ok=true
						s.incr();
						if(name.eq('not')) {
							if(node.isset(code)) ok=false;
						}
						if(ok) {
							val=s.trim();
							node.set(code, val);
						}
					}
					s.pos(ep);
					return;
				}
				if(typeof(name,'num')) {
					val=name
				} else if(node && node.isset(name) ) {
					val=node.get(name)
					not(val) val=fn.get(name);
					if(val && val.ch('>')) {
						v=val.trim(1);
						val="store.$v";
					}
				}
				not(val, skip) {
					// default 값 설정
					if(s.ch('|')) {
						val=s.incr().trim();
						s.pos(ep);
					}
				}
			}
			not(skip) {
				val=@was.contentValue(val,fn,node);
				if(s.ch('(')) {
					param=s.match();
					val.add("($param)");
				}
			}
		} else {
			// (ex) ${read(css/test.css) ? @{}}
			val=@was.contentValue(fn.get('_result'),fn,node);
		}
		if(varName) pfn.set(varName, val);
		return s.cur();
	}
	 
	@was.varContentCheck(&s,node) {
		use(fn);
		if(isFunc(s)) {
			fnm=s.move().lower();
			param=s.match();
			if(fnm.eq('not')) {
				@was.varContent(param,'val',node,true);
				return when(val,false,true);
			} 
			if(fnm.eq('typeof')) {
				a=param.findPos(',').trim();
				b=param.findPos(',').trim();
				if(node.isset(a)) {
					val=node.get(a);
					not(val) return false;
					if(b.eq('node','array')) fn.set('_checkObject', val);
					if(b.eq('src','string')) return true
					if(b.eq('num')) return typeof(val,'num')
					if(b.eq('store')) return val.ch('>') || val.start('store.')
					if(b.eq('object')) return typeof(val,'node','array');
					if(b.eq('node')) return typeof(val,'node')
					if(b.eq('array')) return typeof(val,'array');
				} else {
					if(b.eq('null')) return true
				}
				return false;
			} 
			if(fnm.eq('read')) {
				if(param.ch('/')) {
					path=webRoot();
				} else {
					was=Baro.was();
					path=was.templatePath;
				}
				not(path) return false;
				name=param.trim();
				filePath="$path/$name");
				if(isFile(filePath)) {
					fn.set('_result',@was.contentValue(fileRead(filePath),fn,node));
					return;
				}
			}
			return false;
		}
		oper=0;
		ok=false,a='',b='';
		s.pos(@was.varContent(s,'a',node,true));
		c=s.ch();
		if(c.eq(',')) {
			/* (ex)  @{ a,b,c ? ok } */
			while(c.eq(',')) {
				name=s.incr().move();
				if(node && node.isset(name) ) {
					val=node.get(name)
				} else {
					val=fn.get(name)
				}
				not(val) return false;
			}
		}
		not(ch) return when(a,true,false);
		if(c.eq('=','!','<','>')) {
			c1=s.incr().ch();
			if(c1.eq('=')) {
				c=s.incr().ch();
				if(c.eq('=')) oper=1;
				else if(c.eq('!')) oper=2;
				else if(c.eq('<')) oper=5;
				else if(c.eq('>')) oper=6;
			} else {
				c=c1;
				if(c.eq('=')) oper=1;
				else if(c.eq('<')) oper=3;
				else if(c.eq('>')) oper=4;
			}
		} 
		if(oper) {
			s.pos(@was.varValue(s,'b',node,true));
			switch(oper) {
			case 1: ok=a.eq(b);
			case 2: ok=a.ne(b);
			case 3: ok=a.lt(b);
			case 4: ok=a.gt(b);
			case 5: ok=a.le(b);
			case 6: ok=a.ge(b);
			}
		} else {
			ok=when(a,true,false);
		}
		return ok;
	}
	@was.contentValue(&s, fn, node) {
		not(typeof(s,'string')) return;
		not(s.find('@{')) return s;
		if(s.find('@@')) s=s.replace('@@','@{name}', 16);
		return @was.pageContentParse(s, fn, node);
	}
	@was.content(&s, fn, node) {
		if(s.find('@@')) s=s.replace('@@','@{name}', 16);
		return @was.pageContentParse(s, fn, node);
	}
	@was.widgetContent(&s,fn,node) {		
		not(fn) return s;
		if(s.find('<css')) s=parseCss(s);
		if(s.find('<script')) s=parseScript(s);
		if(s.find('<vars')) s=parseVars(s);
		return s;
		parseCss=func(&s) {
			ss='';
			while(s.valid()) {
				left=s.findPos('<style',0,1);
				ss.add(left);
				not(s.ch()) break;
				src=s.match('<style','</style>');
				if(typeof(src,'bool')) break;
				src.findPos('>')
				fn.append('css', src);
			}
			return ss;
		};
		parseScript=func(&s) {
			ss='';
			while(s.valid()) {
				left=s.findPos('<script',0,1);
				ss.add(left);
				not(s.ch()) break;
				src=s.match('<script','</script>');
				if(typeof(src,'bool')) break;
				src.findPos('>')
				fn.append('script', src);
			}
			return ss;
		};
		parseVars=func(&s) {
			ss='';
			while(s.valid()) {
				left=s.findPos('<vars',0,1);
				ss.add(left);
				not(s.ch()) break;
				src=s.match('<vars','</vars>');
				if(typeof(src,'bool')) break;
				src.findPos('>')
				fn.append('vars', src);
			}
			return ss;
		};
	}
	@was.template(code, param) {
		fn=Cf.funcNode('parent');
		fn.set("_reqParam", param);		
		return @was.templateTag(code,fn,param)
	}
	@was.templateContent(code, param) {
		fn=Cf.funcNode('parent')
		src=object("src.template").get(code)
		return @was.pageContentParse(src,fn,param);
	}
	@was.templateSource(&src, param) {
		fn=Cf.funcNode('parent');
		fn.set("_reqParam", param);
		return @was.pageContentParse(src, fn, node);
	}
	@was.templateTag(&s,fn,node) {
		if(s.find('.')) {
			tag=s.findPos('.').trim();
			name=s.trim();
		} else {
			name=s.trim();
			if(object("src.widget").isset(name)) {
				tag='widget';
			} else {
				tag='template';
			}
		}
		not(name) return;
		if(tag=='widget') {
			ss=@was.contentValue(object("src.widget").get(name),fn,node)
			if(typeof(fn,'func')) 
				return @was.widgetContent(ss,fn,node)
			else
				return ss
		}
		if(tag=='component') {
			obj=object("component.${name}")
			if(node.tag) {
				name.add(node.tag);
			}
			src=format('{name:#{0}, template:`#{1}`, #{2}}', Cf.jsValue(name), 
				@was.contentValue(obj.template,fn,node), 
				@was.contentValue(obj.script,fn,node)
			);
			if(fn.get("components")) fn.append("components",",");
			fn.append("components", src);
			return;
		} 
		return @was.contentValue(object("src.$tag").get(name),fn,node);
	}
	
	@was.pageContentParse(&s, fn, node) {
		rootCheck=false;
		not(fn) {
			fn=Cf.funcNode('parent');
			rootCheck=true;
		}
		not(node) node=_node();
		rst='';
		while(s.valid()) {
			left=s.findPos('@{',0,1);
			rst.add(left);
			not(s.ch()) break;
			k=s.incr().match(1);
			if(typeof(k,'bool')) break;
			ch=k.ch();
			not(ch) continue;
			if(ch.eq('[')) {
				cur=node;
				str=k.match();
				if(k.valid()) {
					cur=_node().parseJson(k);
					while(code, cur.keys()) {
						if(code.eq("tag")) continue
						ss=cur.get(code);
						if(fn.isset(ss)) cur.set(code, fn.get(ss));
					}
				}
				rst.add(@was.templateTag(str,fn,cur) );
			} else {
				// @{a? []: b? '' : c? c: <text></text> : d? (): '' }
				if(k.find('?')) {
					ok=false;
					while(k.valid()) {
						val='';
						if(k.find('?',1)) {
							str=k.findPos('?',1);
							ok=@was.varContentCheck(str,node);
							val=keyVal();
						} else {
							not(ok) ok=true;
							val=keyVal();
						}
						if(ok) {
							rst.add(val);
							break;
						}
						if(k.ch(':')) {
							k.incr();
						} else {
							print("content parse check break");
							break;
						}
					}
				} else {
					@was.varContent(k,'val',node);
					if(val) rst.add(val);
				}
			}
		}
		if(rootCheck ) {
			src=fn.get("components");
			if(src) {
				rst.add("<components>[${src}]</components>");
			}
		}
		return rst;
		keyVal=func() {
			if(k.start("{{")) {
				val=k.match("{{","}}");
				if(val.find('@{')) val=@was.content(val,fn,node);
				return "{{$val}}";
			}
			c=k.ch(), v='', val='';
			if(c.eq()) {
				v=k.match();
			} else if(c.eq('(')) {
				val=k.match(); 
			} else if(c.eq('<')) {
				sp=k.cur();
				tag=k.incr().move();
				k.pos(sp);
				str=k.match("<$tag","</$tag>");
				if(ok) {
					if(typeof(str,'bool')) {
						v="$tag not match";
					} else {
						if(tag.eq('s','text','tag')) {
							str.findPos('>');
							if(tag.eq('s')) {
								val="{{$str}}";
							} else {
								val=str;
							}
						} else if(tag.eq('fetch')) {
							if(typeof(_checkObject,'node','arr')) {
								if(typeof(_checkObject,'array') || _checkObject.childCount() ) {
									temp=null;
									while(cur,_checkObject) {
										if(typeof(cur,'node')) {
											val.add(fmt(str,cur));
										} else {
											not(temp) temp=_node()
											temp[value]=cur;
											val.add(fmt(str,temp));
										}
									}
								} else if(typeof(_checkObject,'node')) {
									val.add(fmt(str,_checkObject))
								}
							}
						} else {
							val="<$tag$str</$tag>";
						}
					}
				}
			} else if(c.eq('[')) { 
				str=k.match();
				if(ok) {
					not(k.ch(':')) {
						cur=node;
						if(k.valid()) {
							cur=_node().parseJson(k);
							while(code, cur.keys()) {
								if(code.eq("tag")) continue
								ss=cur.get(code);
								if(fn.isset(ss)) cur.set(code, fn.get(ss));
							}
						}
					}
					v=@was.templateTag(str,fn,cur);
				}
			} else {
				val=k.findPos(':',1,1)
			}
			print("content==>$val");
			not(ok) return;
			not(val.find('@{')) return val;
			return @was.content(val,fn,node);
		};
	}
	@was.pageContent(&s, subpageCode, node) {		
		c=s.ch()
		not(c) return;
		not(subpageCode) subpageCode='subContent' 
		not(node) node=_node()
		if(c.eq('{')) {
			ss=s.match()
			node.parseJson(ss)
		}
		if(node.style) node.contentStyle=node.style
		type='content'
		while(s.valid() ) {
			left=s.findPos('//##')
			if(left.ch()) {
				switch(type) {
				case 'content': node.content=left
				case 'vars': node.vars=left
				case [js,script]: node.script=left
				case [css,style]: node.css=left
				}
			}
			if(s.ch('>')) s.incr()
			type=s.findPos("\n").trim()
			not(s.ch()) break;
		}
		return @was.templateContent(subpageCode, node);
	}

</func>


<func>
@was.loadUrlMap() {
	db=Baro.db('config')
	node=db.fetchAll("select grp, cd, data from conf_info where grp like 'urlMap#%'")
	while(cur, node) {
		cur.inject(grp, cd, data)
		name=rightVal(grp,'#')
		url=cd
		print(">> load url ", name, url, data.size() )
		@was.addWebpageSource(url, name, data)
	}
}

@was.addWebpageSource(url, name, &s) {
	not(url&&name) return print("페이지 소스 등록오류 (URL:$url, NAME:$name)")	
	template='', src=''
	while(s.valid()) {
		left=s.findPos('<src',0,1)
		template.add(left)
		not(s.ch()) break;
		ss=s.match('<src','</src>')
		ss.findPos('>')
		src.add(ss)
	}
	return @was.addWebpageMap(url, name, template, src);
}
@was.addWebpageMap(url, name, template, src) {
	map=Baro.was().urlMap()
	path=System.path();
	conf("src#pageTemplate.$name", template, true)
	source=#[
		${src} 
		pageTemplate=conf("src#pageTemplate.${name}")
		req.send(@was.pageSource(pageTemplate,param))
	]
	fnm="@WebPage.${name}"
	call("${fnm}(req, param) { ${source} }");
	print(">> add web page map ==> ", fnm, call(fnm))
	map[$url]=call(fnm); 
}

@was.templateContent(&s,node,fnRoot) {		
	not(fn) return s;
	if(s.find('<css')) s=parseCss(s);
	if(s.find('<script')) s=parseScript(s);
	if(s.find('<vars')) s=parseVars(s);
	return @was.parseContent(s,node,fnRoot);
	
	parseCss=func(&s) {
		ss='';
		while(s.valid()) {
			left=s.findPos('<style',0,1);
			ss.add(left);
			not(s.ch()) break;
			src=s.match('<style','</style>');
			if(typeof(src,'bool')) break;
			src.findPos('>')
			fn.append('css', src);
		}
		return ss;
	};
	parseScript=func(&s) {
		ss='';
		while(s.valid()) {
			left=s.findPos('<script',0,1);
			ss.add(left);
			not(s.ch()) break;
			src=s.match('<script','</script>');
			if(typeof(src,'bool')) break;
			src.findPos('>')
			fn.append('script', src);
		}
		return ss;
	};
	parseVars=func(&s) {
		ss='';
		while(s.valid()) {
			left=s.findPos('<vars',0,1);
			ss.add(left);
			not(s.ch()) break;
			src=s.match('<vars','</vars>');
			if(typeof(src,'bool')) break;
			src.findPos('>')
			fn.append('vars', src);
		}
		return ss;
	};
}
@was.subPageSource(&s,node) {
	fn=Cf.funcNode()
	fn.set("params", node)
	src=@was.pageSource(s,node,fn)
	if(fn.isset('vars')) {
		src.add('<vars>',fn.get('vars'),'</vars>')
	}
	if(fn.isset('script')) {
		src.add('<script>',fn.get('script'),'</script>')
	}
	if(fn.isset('css')) {
		src.add('<style>',fn.get('css'),'</style>')
	}
	return src;
}
@was.pageSource(&s,node,fnRoot) { 
	not(fnRoot) fnRoot=Cf.funcNode('parent')
	rst=''
	while(s.valid()) {
		left=s.findPos('<$')
		rst.add(@was.parseContent(left,node,fnRoot))
		c=s.ch()
		not(c) break; 
		if(c.eq('$')) {
			s.incr()
			ty='template'
		} else {
			ty='widget'
		}
		sp=s.cur()
		c=s.next().ch()
		if(c.eq(':','#')) c=s.incr().next().ch()
		ep=s.ch()
		tagName=s.trim(sp,ep,true)
		prop=_node() _parseProp()
		if(ty=='template') {
			src=conf("src#template.${tagName}")
			rst.add(@was.templateContent(src,prop,fnRoot))
		} else {
			src=conf("src#widget.${tagName}")
			if(src) {
				name=prop.name
				not(name) name=tagName
				src=_parseWidget(src, name)
				if(src) rst.add(src)
			} else {
				rst.add("=> $tagName 소스 미정의")
			}
		}
	}
	return rst;

	_parseWidget=func(&s, name) {
		rst=''
		while(s.valid()) {
			left=s.findPos('@@')
			rst.add(left)
			not(s.ch()) break
			rst.add("store.$name")
		}
		return @was.templateContent(rst,prop,fnRoot);
	};
	_parseProp=func() {
		while(s.valid()) {
			sp=s.cur()
			c=s.next().ch()
			while(c.eq('-')) c=s.next().ch()
			code=s.trim(sp, s.cur(), true)
			if(c.eq('=')) {
				c=s.incr().ch()
				if(c.eq()) {
					val=s.match()
					if(val.find('@{')) val=@was.parseContent(val,node, fnRoot)
					prop.set(code,val)
				} else if(c.eq('{','[','(')) {
					if(c.eq('(')) {
						c=s.ch(1)
						if(c.eq('[')) {
							src=s.match('([','])')
							val=@was.pageSource(src,node,fnRoot)
						} else {							
							val=s.match()
							s.ch()							
							if(s.start('=>',true)) {
								fparam=val.trim()
								if(s.ch('{')) {
									src=s.match()
								} else {
									if(lineCheck(s,';')) src=s.findPos(';')
									else src=s.findPos("\n")
								}
								val="($fparam)=>{$src}"
							}
						}
						prop.set(code,val)
					} else if(c.eq('{')) {
						val=s.match()
						prop.addNode(code).parseJson(val)
					} else {
						val=s.match()
						prop.parseJson("$code:[$val]")
					}
				} 
			} else if(c.eq('(')) {
				fparam=s.match()
				if(s.ch('{')) {
					fsrc=s.match()
					if(code=='init') {
						fnRoot.append("vars", fsrc)
					} else if(code=='load') {
						fnRoot.append("script", fsrc)
					} else {
						prop.set(code,"($fparam)=>{$fsrc}")
					}
				} 
			} else {
				prop.set(code,true)
			}
			c=s.ch()
			if(c.eq('/','>')) {
				if(c.eq('/')) {
					s.findPos('>')
				} else {
					s.incr()
				}
				break;
			}
		}
	};
}
@was.parseContent(&s,node, fnRoot) {
	if(s.find('<$')) return @was.pageSource(s,node,fnRoot)
	rst='';
	while(s.valid()) {
		left=s.findPos('@{',0,1);
		rst.add(left);
		not(s.ch()) break;
		ss=s.incr().match(1);
		if(typeof(ss,'bool')) {
			line=s.findPos("\n")
			print("parse content not match line==$line")
			continue;
		}
		if(ss.find('?')) {
			ok=false;
			while(ss.valid()) {
				val='';
				if(ss.find('?',1)) {
					str=ss.findPos('?',1);
					ok=@was.parseCheck(str,node,fnRoot);
					val=keyVal();
				} else {
					not(ok) ok=true;
					val=keyVal();
				}
				if(ok) {
					rst.add(val);
					break;
				}
				if(ss.ch(':')) {
					ss.incr();
				} else {
					if(ss.ch()) print("parse content check break line==$ss");
					break;
				}
			}
		} else {
			print("parse content ss=$ss")
			@was.parseVar(ss,'val',node);
			if(val) rst.add(val);
		}
	}
	return rst;
	keyVal=func() {
		c=ss.ch(), val='';
		if(c.eq()) {
			v=ss.match();
			val=Cf.val(c,val,c)
		} else {
			v=ss.findPos(':',1,1)
			@was.parseVar(v,'val',node)
		}
		not(ok) return;
		return val;
	};
}
@was.parseCheck(&s,node,fnRoot) {
	if(isFunc(s)) {
		fnm=s.move().lower();
		param=s.match();
		if(fnm.eq('not')) {
			@was.parseVar(param,'val',node,true);
			return when(val,false,true);
		} 
		if(fnm.eq('typeof')) {
			a=param.findPos(',').trim();
			b=param.findPos(',').trim();
			if(node.isset(a)) {
				val=node.get(a);
				not(val) return false;
				if(b.eq('string')) return true
				if(b.eq('num')) return typeof(val,'num')
			} else {
				if(b.eq('null')) return true
			}
			return false;
		}  
		return false;
	}
	oper=0;
	ok=false,a='',b='';
	s.pos(@was.parseVar(s,'a',node,true));
	c=s.ch();
	if(c.eq(',')) {
		/* (ex)  @{ a,b,c ? ok } */
		while(c.eq(',')) {
			name=s.incr().move();
			if(node && node.isset(name) ) {
				val=node.get(name)
			}
			not(val) return false;
		}
	}
	not(ch) return when(a,true,false);
	if(c.eq('=','!','<','>')) {
		c1=s.incr().ch();
		if(c1.eq('=')) {
			c=s.incr().ch();
			if(c.eq('=')) oper=1;
			else if(c.eq('!')) oper=2;
			else if(c.eq('<')) oper=5;
			else if(c.eq('>')) oper=6;
		} else {
			c=c1;
			if(c.eq('=')) oper=1;
			else if(c.eq('<')) oper=3;
			else if(c.eq('>')) oper=4;
		}
	} 
	if(oper) {
		s.pos(@was.parseVar(s,'b',node,true));
		switch(oper) {
		case 1: ok=a.eq(b);
		case 2: ok=a.ne(b);
		case 3: ok=a.lt(b);
		case 4: ok=a.gt(b);
		case 5: ok=a.le(b);
		case 6: ok=a.ge(b);
		}
	} else {
		ok=when(a,true,false);
	}
	return ok;
}
@was.parseVar(&s,varName,node,skip) { 
	use(fnRoot)
	pfn=Cf.funcNode('parent');
	ch=s.ch() sp=s.cur()
	pfn.set(varName, '');
	if(skip) {
		ss=s.find(':',1);
		ep=ss.size();
	} else {
		ep=s.end()
	}
	if(sp>=ep) ep=sp+1;
	not(ch) return ep;
	flag=0
	if(ch.eq(':')) {
		flag=1
		s.incr()
	}
	name='', val=''
	if(isFunc(s)) {
		fnm=s.move().lower();
		param=s.match();
		a='', c=param.ch()
		if(c.eq()) { 
			a=param.match().trim() 
		} else {
			a=param.trim()
		}
		switch(fnm) {
		case module:
			val=conf("js#module.$a")
		case component:
			src=conf("src#component.$a")
			val=#[
				global.addComponent('${a}',`${src}`)
			];
		case js:
			val=conf("js#$a")
		case css:
			val=conf("css#$a") 
		case conf:
			val=conf(a)
		case read:
			val=fileRead(a)
		default:
		}
	} else if(ch.eq()) {
		val=s.match()
	} else if(ch.eq('[')) {
		val=@was.parseContent(s.match(),node,fnRoot)
	} else {
		name=s.move();
		if(typeof(name,'num')) {
			val=name
		} else if(name.eq('null','true','false')) {
			val=name.typeValue()
		} else if(node && node.isset(name) ) {
			val=node.get(name)
			not(val) val=fnRoot.get(name)
		} else {
			val=fnRoot.get(name)
		}
		not(skip) {
			if(typeof(val,'bool')) {
				if(val) val=name else val=''
			} else {
				not(val) {
					if(s.ch('=')) {
						val=s.incr().trim();
						s.pos(ep);
					}
				}
			}
		} 
	}
	chk= name && flag.eq(1) && val
	if( chk ) {
		pfn.set(varName, "${name}: `${val}`");
	} else {
		pfn.set(varName, val);
	}
	return s.cur();
}
</func>