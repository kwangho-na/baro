<func note="기본함수">
	memberFunc(obj, init, grp) {
		map=Cf.getObject('user','subfuncMap')
		if(init) {
			src="onInit() {$init}"
			obj[$src]
		}
		addFunc(map.get(grp))
		addFunc=func(&s) {
			while(s.valid() ) {
				fnm=s.findPos(',').trim()
				not(fnm) break;
				fc=call("${grp}.${fnm}")
				if(typeof(fc,'func')) obj[$fnm]=fc
			}
		}
		return obj
	}
	setEvent(obj, name, fc) {
	 	ty=typeof(fc)
	 	print("$name event type fc == $ty $fc")
	 	if(ty.eq('func')) {
	 		fn=fc
	 	} else if(ty.eq('funcRef') ) {
	 		fn=call(fc)
	 	}
	 	prev=obj.get(name)
	 	if(typeof(prev,'func')) {
	 		prev.delete()
	 	}
	 	print("set event $name ", fn, obj)
	 	obj.set(name, fn)
	}
	checkMember(a) {
		fn=Cf.funcNode(this)
		not(fn) return false;
		return fn.isset(a);
	}
	toLong(s) {
		a=when(typeof(s,'number'),"$s",s)
		return a.toLong()
	}
	toDouble(s) {
		a=when(typeof(s,'number'),"$s",s)
		return a.toDouble()		
	}
	setCallback(name, val) {
		if(typeof(name,'bool','null')) {
			val=name
			name=null
		}
		not(name) {
			name="callback"
		}
		if(typeof(val,'null')) {
			return this.member(name, null)
		}
		fn=Cf.funcNode("parent")
		if( typeof(val,'bool') && val) {
			prev=this.member(name)
			prev.delete()
		}
		this.member(name, fn)
	}
	classLoad(mapCheck, classPath ) { 
		not(classPath) {
			path=System.path()
			classPath=Cf.val(path,"/data/libs/classes")
		}
		if( mapCheck ) {
			db=Baro.db('config')
			node=db.fetchAll("select grp, cd, data from conf_info where grp='mapClassName'")
			print("map check node=>$node")
			map=object('map.className')
			while(cur, node) {
				cur.inject(grp, cd, data)
				map.set(cd, data)
			}
			print("map=========>$map")
		}
		classLoadPath(classPath)
	}
	classLoadAll() {
		db=Baro.db('config')
		node=db.exec("select grp, cd from conf_info where grp='classModify'")
		while(cur, node) {
			cur.inject(grp, cd)
			conf("classModify.${cd}", 0)
		}
		classLoad()
	}
	classLoadPath(path, pathLen) {
		not(path) return;
		not(pathLen) pathLen=path.size()
		fo=Baro.file()
		fo.list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath, ext)
				if( type=='folder') {
					if(name.eq('temp')) continue;
					classLoadPath(fullPath, pathLen)
					continue;
				}
				if(ext.eq('js','src')) {
					relative=fullPath.trim(pathLen+1)
					groupId=relative.findPos('.').trim()
					modify=Baro.file().modifyDate(fullPath)
					prev=conf("classModify.$groupId")
					if( prev && modify.le(prev) ) {
						src=conf("funcSource.$groupId")
						if(src) {
							Cf.sourceApply("<func>${src}</func>", groupId, true)
						}
						if( conf('local.classMapCheck') ) {
							classMapCheck(src, groupId)
						}
						continue;
					}
					print("클래스소스 변경 경로:$fullPath (변경:$modify)", groupId)
					conf("classModify.$groupId", modify, true)
					src=fileRead(fullPath)
					classSource(src, groupId, fullPath, modify )
				}
			}
		});
	}
	
	classFuncLoad(name) {
		db=Baro.db('config')
		node=db.fetchAll("select data from conf_info where grp='funcSource'")
		src=''
		while(cur, node) {
			src.add(cur.data,"\n")
		}
		not(src) {
			print("$name/func 함수정보가 없습니다")
			return;
		}
		Cf.sourceApply("<func>${src}</func>", "${name}/func", true)
	}
	classLayout(name, skip) {
		src=conf("layoutSource.${name}")
		not(src) return print("$name layout source 오류");
		Cf.sourceApply(#[
			<widgets base="${name}">${src}</widgets>
		]);
		while(cur,objectArray("page.$name:", "object")) {
			if(cur.cmp('id','main')) {
				return cur;
			}
		}
		return node;
	}
	classStartCheck(&s) {
		type=s.move()
		not(type.eq('class')) return false;
		c=s.next().ch()
		while(c.eq('-')) c=s.next().ch()
		if(c.eq('{')) return true;
		name=s.move()
		if(name.eq('extends', 'extend')) {
			sp=s.cur()
			c=s.next().ch()
			while(c.eq('/',':','-',',')) c=s.next().ch()
			if(c.eq('{')) {
				return s.trim(sp, s.cur());
			}
		}
		return false;
	}
	classMapCheck(src, groupId) {
		parse = func(&s) {
			while(s.valid() ) {
				c=s.ch()
				if(c.eq(',',';')) {
					s.incr()
					continue;
				}
				chk=classStartCheck(s)
				not(chk) {
					return print("클래스 맵체크 오류 (경로: groupId)");
				}
				s.next().ch()
				if(typeof(chk,'bool')) {
					className=s.findPos('{',0,1).trim()
				} else {
					sp=s.cur()
					c=s.next().ch()
					while(c.eq('/',':','-')) c=s.next().ch()
					className=s.trim(sp,s.cur())
					s.findPos('{',0,1)
				}
				not(className) return;
				not(groupId ) groupId=className
				if( groupId.eq(className) ) {
					mapId=className
				} else {
					if( lastEq(groupId, className)) {
						mapId=groupId
					} else {
						mapId="${groupId}:${className}"
					}
				}  
				src=s.match(1)
				if(typeof(src,'bool')) {
					return print("클래스소스 매핑오류 (아이디:$mapId)");
				}
				if( className.eq("layout","func","conf")) {
					 continue;
				}
				not( mapId.eq(className)) {
					object('map.className').set(className, mapId)
					conf("mapClassName.${className}", mapId, true)
				}
			} 
		};
		
		return parse(stripJsComment(src))
	}
	classSource(src, groupId, fullPath, modify) {
		map=object('map.classes')
		parse = func(&s) {
			while(s.valid() ) {
				c=s.ch()
				if(c.eq(',',';')) {
					s.incr()
					continue;
				}
				chk=classStartCheck(s)
				not(chk) {
					if(s.ch()) {
						line=s.findPos("\n");
						print("class load match error line=$line");
					}
					return;
				}
				s.next().ch()
				if(typeof(chk,'bool')) {
					className=s.findPos('{',0,1).trim()
				} else {
					sp=s.cur()
					c=s.next().ch()
					while(c.eq('/',':','-')) c=s.next().ch()
					className=s.trim(sp,s.cur())
					conf("extends.$className", chk, true)
				}
				not(className) return;
				not(groupId ) groupId=className
				if( groupId.eq(className) ) {
					mapId=className
				} else {
					if( lastEq(groupId, className)) {
						mapId=groupId
					} else {
						mapId="${groupId}:${className}"
					}
				}
				node=map.get(mapId)
				if( typeof(node,'node') ) {
					node.updateTm=System.localtime()
					if(node.source ) {
						node.source=''
					}
				} else {
					node=map.addNode(mapId)
					node.groupId=groupId
					node.name=className
					node.regTm=System.localtime()
				}
				if(modify ) {
					node.path=fullPath
					node.modifyDate=modify 
				}
				src=s.match(1)
				if(typeof(src,'bool')) {
					node.error="클래스소스 매칭오류 (아이디:$mapId)"
					return print(node.error);
				}
				if( className.eq("layout","func")) {
					if( node.source) {
						node.appendText("source",src)
					} else {
						node.source=src;
					}
				} else if(className.eq("conf")) {
					setConfSrc(groupId,src)
				} else { 
					not( mapId.eq(className)) {
						conf("mapClassName.${className}", mapId, true)
						object('map.className').set(className, mapId)
					}
					conf("class.$mapId", src, true)
					print("class $mapId loaded")
				}
			}
			node=map.get("${groupId}:layout")
			if(node) {
				conf("layoutSource.$groupId", node.source, true)
			}
			node=map.get("${groupId}:func")
			if(node) {
				conf("funcSource.$groupId", node.source, true)
				Cf.sourceApply("<func>${node.source}</func>", groupId, true)
			}
		};
		
		setConfSrc = func( groupId, &s) {
			while(s.valid()) {
				c=s.ch()
				not(c) break;
				if(c.eq(',',';')) {
					s.incr()
					continue;
				}
				code=s.move()
				c=s.ch()
				not(c.eq(':')) break;
				c=s.incr().ch()
				if(c.eq()) {
					v=s.match()
				} else if( c.eq('<')) {
					sp=s.cur()
					c=s.incr().next().ch()
					while(c.eq('-')) c=s.incr().next().ch()
					tag=s.trim(sp+1,s.cur(),true)
					s.pos(sp)
					ss=s.match("<$tag","</$tag>")
					if(tag.eq('text','sql')) {
						ss.findPos('>')
						v=ss
					} else {
						v=s.value(sp, s.cur(), true)
					}
				} else {
					v=s.findPos("\n");
				}
				conf("${groupId}.${code}", v, true)
			}
		};
		return parse(stripJsComment(src))
	}
	classReload(param) {
		if(typeof(param,'node') && param.var(useClass) ) {
			param.var(useClass,false)
			arr=param.var(classNames)
			if(typeof(arr,'array')) {
				name=arr.get(0)
				arr.reuse()
				if(name) class(param, name)
			}
		}
		return param;
	}
	classExtends(obj, &s ) { 
		while(s.valid()) {
			name=s.findPos(',').trim() 
			if(name) {
				class(obj, name)
			}
		}
	}
	class(param) {
		baseName=func(name,base) { 
			not(base) return name;
			if(base.find(':')) {
				base=left(base,':')
			}
			if(lastEq(base,name)) {
				return base
			} else {
				return "$base:$name"
			}
		}
		switch(args().size()) {
		case 1: 
			if(typeof(param,'node') ) {
				className=param.id
				obj=param
			} else {
				className=param
				obj=object("class.$className")
			}
		case 2:
			if(typeof(param,'string') ) {
				args(className, base)
				if(typeof(base,'bool')) {
					base=this.var(baseCode)
				}
				className=baseName(className, base)
			} else {
				args(obj,className)
			}
		case 3:
			args(obj,className,base)
			if(typeof(base,'bool')) {
				base=obj.var(baseCode)
			}
			if( base ) {
				className=baseName(className, base)
			}
		default:
		}
		not(typeof(obj,'node')) return print("$className class 객체 미설정(obj:$obj)")
		not(className) return print("class 매개변수 미설정")
		print("class $className 시작")
		src=conf("class.$className")
		not(src) {
			not(className.find('/')) {
				mapId=object('map.className').get(className)
				src=conf("class.$mapId")
			}
			not(src) return print("class $className 클래스 소스 미등록 (mapId:$mapId)")
		}
		arr=obj.addArray("@classNames") 
		find=arr.find(className)
		if(find.ne(-1)) {
			print("$className 클래스 이미 등록됨")	 
		} else {
			extend=conf("extends.$className")
			if( typeof(obj,'widget')) {
				print("class $className 위젯객체")
				tag=obj.tag;
				if(tag.eq('page','dialog','main')) {
					not(className.eq('page')) class(obj,'page')
				} else { 
					not(className.eq('widget')) {
						if(tag.eq('context','canvas')) {
							not(className.eq('draw')) class(obj,'draw')
						}
						class(obj,'widget')
					}
				}
			}
			if(extend) {
				classExtends(obj, extend)
			}
			arr.add(className)
			parse(obj, src)
			obj.var(useClass, true)
			if(typeof(obj.initClass,'func')) {
				print("class initClass 함수 실행시작")
				obj.initClass()
			}
		}
		return obj;
		
		parse=func(obj, &s) {			
			init='', funcs='';
			n=0;		
			while(s.valid()) {
				if(funcCheck(s)) {
					sp=s.cur()
					fnm=s.move()
					if(fnm.eq('private','public')) {
						sp=s.cur()
						s.next().ch()
					} else {
						s.ch()
					}
					s.match()
					s.match(1)
					src=s.value(sp, s.cur(), true)
					funcs.add(src)
					c=s.ch()
					if(c.eq(',',';')) s.incr();
					continue;
				} 
				line=s.findPos("\n").trim()
				if(n) init.add("\n")
				init.add(line)
				n++;
			}
			 
			fnInit=Cf.funcNode(obj)
			if(fnInit) {
				if(funcs) obj[$funcs]
				if(init) {
					eval(init, obj, fnInit, true)
					print("onInit 이미 설정됨 eval 실행 $className", fnInit.get(), obj)
				}
			} else {
				fnParent=Cf.funcNode('parent')
				src="onInit() {$init} $funcs"
				obj[$src]
				obj.onInit(fnParent)
			}
		};
		funcCheck = func(&s) {
			not(s.ch()) return false;
			fnm=s.move()
			if(fnm.eq('private','public')) {
				c=s.next().ch()
			} else {
				c=s.ch()
			}
			if(c.eq('(')) {
				s.match()
				c=s.ch()
				if(c.eq('{')) return true
			}
			return false
		};
	}
	objectArray(key, flag) {
		arr=[]
		not(flag) flag='name'
		root=Cf.getObject()
		while(name, root.keys()) {
			if(name.start(key)) {
				switch(flag) {
				case name: arr.add(name)
				case object: arr.add(root.get(name))
				default: break;
				}
			}
		}
		return arr;
	}
	fn(&s) {
		not(s) return;
		fn=Cf.funcNode('parent')
		while(s.valid()) {
			name=s.findPos(',').trim()
			not(fn.isset(name)) return false;
		}
		return true;
	} 
	fnValue(name) {
		fn=fn(name)
		not(typeof(fn,'func')) return print("$name parent function not found")
		switch(args().size()) {
		case 1:
			return fn.get(name)
		case 2:
			args(1,value)
			fn.set(name,value)
		default:
		}
	}
	paramNode(reset, &props) {
		node=this.addNode("param")
		if(reset) node.removeAll(true)
		if(props) node.parseJson(props)
		return node;
	}
	arrayFind(arr, key) {
		not(typeof(arr,'array')) return false;
		idx=arr.find(key);
		return idx.ne(-1);
	}
	
	isFile(fileName) {
		fo=Baro.file();
		return fo.isFile( localPath(fileName) );
	}
	isFolder(path, makeCheck) {
		fo=Baro.file();
		fullPath=localPath(path);
		folder=fo.isFolder(fullPath);
		not(folder) {
			if(makeCheck) {
				fo.mkdir(fullPath, true);
				folder=fo.isFolder(fullPath);
			}
		}
		return folder;
	}
	fileRead(path) {
		fo=Baro.file('read'); // 파일객체 생성
		not(fo.open(path,'read')) {
			return print("readFile open error (경로 $path)");
		}
		src = fo.read();
		fo.close()
		return src;
	}
	fileWrite(path, buf, mode) {
		not(mode) mode="write";
		fo=Baro.file('save');
		if(path.find('/')) {
			str=path.findLast('/').trim();
		} else {
			str=path;
		}
		not(fo.isFolder(str)) {
			fo.mkdir(str, true);
		}
		not(fo.open(path,mode)) return print("writeFile open error (경로 $path)");
		fo.write(buf);
		fo.close();
	}
	fileAppend(path, data) {
		fo=Baro.file('append');
		if(fo.open(path,'append')) {
			fo.append(data);
			fo.close();
		}
	}
	fileDelete(path) {
		fo=Baro.file();
		if(isFile(path)) {
			result=fo.delete(path);
		} else if(isFolder(path)) {
			result=fo.rmDir(path);
		}
		return result;
	}
	fileFind(path, flag, val, check, arr) {
		not(arr) arr=_arr();
		num=0
		if(typeof(flag,'string')) {
			switch(flag) {
			case eq: flag=1;
			case index: flag=2;
			case ext: flag=3;
			case modify: flag=4;
				if(typeof(val,'string') ) {
					val=System.localtime(val)
				}
			case all: flag=9;
			default:
			}
		}
		not(flag) {
			if(val) {
				flag=1;
			} else {
				flag=9;
			}
		}
		Baro.file().list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath, ext, modifyDt);
				if(type=='folder') {
					if(check) {
						fileFind(fullPath, flag, val, check, arr)
						if(flag.eq(1,2)) {
							if(arr.size()) return arr;
						}
						
					}
					continue;
				}
				switch(flag) {
				case 1: 
					if(name==val) return arr.add(fullPath);
				case 2: 
					if(num==val) return arr.add(fullPath);
				case 3:
					if(typeof(val,'array')) {
						while(c,val) {
							if(c==ext) {
								arr.add(fullPath);
								break;
							}
						}
					} else {
						if(val==ext) {
							arr.add(fullPath);
						}
					}
				case 4: 
					if(modifyDt>val) arr.add(fullPath);
				case 9:
					arr.add(fullPath);
				default:
				}
				num.incr();
			}
		});
		return arr;
	}
	findField(root, field, val) {
		while( cur, root ) {
			if( cur.cmp(field, val) ) return cur;
			if( cur.childCount() ) {
				find=findField(cur, val);
				if( find ) return find;
			}
		}
		return null;
	}
	findTag(root, tag) {
		while( cur, root ) {
			if( cur.cmp("tag", tag) ) return cur;
			if( cur.childCount() ) {
				find=findTag(cur,tag);
				if( find ) return find;
			}
		}
		return null;
	}
	findId( root, id) {
		while(cur, root) {
			if(cur.cmp("id",id))return cur;
			if( cur.childCount() ) {
				find=findId(cur,id);
				if( find ) return find;
			}
		}
		return;
	}
	randomColor() {
		hue=System.rand(360).toInt(); 
		return Baro.color('hsl', hue, 100, 100);
	}
	randomIcon() {
		num=System.rand(360).toInt();
		Baro.db('icons').fetch("select type, id from icons where type='vicon' limit $num,1"  ).inject( type, id);
		return "$type.$id";
	}

	/* 회전를 위한 기준영역  */
	baseRect(w, h) {
		x=w; y=h;
		x/=2.0, y/=2.0;
		return Baro.rc(-x,-y,w,h);
	}
	/* 주위진 위치에 폭높이만큼 가운데정렬 영역 생성 */
	centerRect(pt, w, h, mode, gab ) {
		pt.inject(x, y);
		w0=w/2.0, h0=h/2.0;
		not( mode ) mode="center";
		switch(mode) {
		case center:
			x-=w0, y-=h0;
		case top:
			x-=w0, y-=h;
			if( gab ) y-=gab;
		case bottom:
			x-=w0, y+=h;
			if( gab ) y+=gab;
		case left:
			x-=w, y-=h0;
			if( gab ) x-=gab;
		case right:
			x+=w, y-=h0;
			if( gab )x+=gab;
		default:
		}
		return Baro.rect(x,y,w,h);
	}
	arraySum(a) {
		sum=0;
		while(n,a) {
			not(typeof(n,"num")) continue;
			sum+=n;
		}
		return sum;
	}
	arrayDivid(&s,size,sp) {
		not(sp) sp=0;
		not(size) size=100;
		a=[];
		arr=_arr();
		a.div(s,size,sp);
		while(n=1,n<a.size(), n++) {
			ep=a.get(n);
			arr.add(ep-sp);
			sp=ep;
		}
		return arr;
	}
	lastEq(a,b) {
		as=a.size(), bs=b.size()
		if(as.gt(bs)) {
			p=as-bs
			aa=a.value(p)
			if(aa.eq(b)) return true;
		}
		return false;
	}
</func>

<func note="공통 배열함수">
	setArray(arr, idx, node) {
		not(typeof(idx,"num")) return arr;
		if(idx.lt(arr.size()) ) {
			arr.set(idx, node);
		} else {
			arr.add(node);
		} 
		return arr;
	} 
	tempArray(node) {
		arr=_arr();
		if(typeof(node,'node','array')) {
			while(cur, node) {
				arr.add(cur);
			}
		} 
		return arr;
	}
</func>

<func note="공통 유틸함수">
	checkModifyFiles(path, tm, arr ) {
		not(arr) arr=_arr();
		fo=Baro.file()
		fo.list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath, ext, modifyDt)
				if(type.eq('folder')) {
					checkModifyFiles(fullPath, tm, arr);
				} else {
					if(modifyDt.gt(tm)) {
						arr.add(fullPath);	
					}
				}
			}
		})
		return arr;
	}
	
	inStr(&s, val) {
		a=val.lower();
		while(s.valid() ) {
			v=s.findPos(',').trim();
			b=v.lower();
			print("$a == $b")
			if(a.eq(b)) return true;
		}
		return false;
	} 
	makeDestPath(name, src, dest) {
		/* ex) 
		name=c:/tesmp/test/aaa
		src= c:/temp 
		dest=d:/data/image
		=> new path=> d:/data/image/test/aaa
		*/
		srcSize=src.size();
		relative=name.trim(srcSize)
		path=name.findLast(name,'/');
		newPath=Cf.val(dest, relative);
		fo=Baro.file("util");
		if(fo.isFolder(newPath)) fo.mkdir(newPath,true);
		return newPath;
	}
	copyFile(src, dest) {
		fo=Baro.file('util');
		path=leftVal(dest,'/');
		not(fo.isFolder(path)) return print("$dest 복사 경로가 폴더가 아닙니다");
		not(fo.isFile(src)) return print("복사대상파일이 없습니다 (파일:$src)");
		not(fo.copy(src, dest)) return print("$src 에서 $dest 복사실패");
	}
	makeFileList(root, isContinue, fo, fullPath, pathSize) {
		not(fo) fo=Baro.file('util');
		not(fullPath) fullPath=root.fullPath;
		not(fullPath) return;
		not(pathSize) pathSize=fullPath.size();
		fo.list(fullPath, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath, size, ext, modifyDt);
				relativePath=fullPath.value(pathSize);
				icon='';
				if(type.eq("folder")) {
					icon="vicon-folder_default";
				} else {
					icon=
				}
				cur=root.addNode().with(type, name, icon, relativePath, size, modifyDt);
				if(isContinue && type.eq("folder")) {
					makeFileList(cur, isContinue, fo, fullPath, pathSize);
				}
			}
		});
	} 
	tickCheck(id,bset) {
		not(id) {
			tick=this.get('@tickCheck');
			if(typeof(tick,'num')) return System.tick()-tick
			return 0;
		}
		if(typeof(id,'string')) {
			if(bset) return this.set(id, System.tick()-2);
			
			tick=this.get(id);
			if(typeof(tick,'num')) {
				return System.tick()-tick;
			}
		} else {
			if(typeof(id,'bool')) { 
				this.set('@tickCheck', System.tick()-2);
			}
		}
		return 0;
	}
</func>

<func note="소스관리 유틸함수">
	stripComment(&s, mode) {
		not(mode) mode=1;
		rst='';
		while(s.valid()) {
			if(mode.eq(1)) {
				left=s.findPos('/*',1,1);
				s.match();
			} else if(mode.eq(2)) {
				left=s.findPos('//',1,1);
				s.findPos("\n");
			} else if(mode.eq(3)) {
				left=s.findPos('<!--',1,1);
				s.match('<!--','-->');
			} else if(mode.eq(4)) {
				left=s.findPos('--',1,1);
				s.findPos("\n");
			}
			rst.add(left);
			not(s.valid()) break;
		}
		return rst;
	}
	stripJsComment(&s) {
		rst=stripComment(s,1);
		return stripComment(rst,2);
	}
	lastWith(&s, val) {
		a=s.findLast(val)
		not(a) return false;
		s.pos(a.size())
		return when(s.eq(val),true);
	}
	@util.nextParam() {
		ty=typeof(vars)
		val=null;		
		if(ty=='stringRef') {
			val=vars.findPos('/').trim()
		}
		return val;
	}
	@util.fileList(info) {
		root=Cf.funcNode('parent').get('root');
		while(info.next()) {
			info.inject(type, name, fullPath, size, modifyDt, createDt)
			modifyDate=System.date('yyyy-MM-dd hh:mm:ss', modifyDt);
			if(root) root.addNode().with(type, name, fullPath, size, modifyDate, createDt);
		}
		return root;
	}
	@util.fileTreeData(info) {
		root=Cf.funcNode('parent').get('root');
		while(info.next()) {
			info.inject(type, name, fullPath, size, modifyDt, createDt)
			if(name.eq('.','..')) continue;
			id=fullPath;
			text=name;
			modifyDate=System.date('yyyy-MM-dd hh:mm:ss', modifyDt); 
			if(root) root.addNode().with(type, id, text, size, modifyDate, createDt);
		}
		return root;
	}
	@util.findSep(&s, ss, sep) {
		not(s.find(ss)) return false;
		not(sep) sep=','
		left=s.findPos(ss)
		if(left) {
			c=left.ch(-1,true)
			if(c && c.ne(sep) ) {
				return false;	
			}
		}
		c=s.ch()
		not(c) return true;
		return c.eq(sep)
	}
	@util.filterTag(arr, &tags, notCheck) {
		a=[]
		while(cur, arr) {
			chk=@util.findSep(tags,cur.tag)
			if(notCheck) {
				not(chk) a.add(cur)
			} else {
				if(chk) a.add(cur)
			}
		}
		return a;
	}
	@util.objectFinds(name) {
		a=[]
		obj=Cf.getObject()
		while(c,obj.keys()) {
			if(c.start(name)) a.add(obj.get(c))
		}
		return a;
	}
</func>

<func>
	@util.deleteFiles(path) {
		fp=Baro.file()
		fp.list(path, func(info) {
			while(info.next()) {
				info.inject(type,fullPath)
				if(type=='file') fp.delete(fullPath)
			}
		})
	}
	@util.htmlResult(type, data) {
		if(type=='read') return this.appendText("@result",data);
		if(type=='finish') @util.htmlResultParse(this.ref(@result));
	}
	@util.htmlResultParse(&html) {
		type=this.var(parseType);
		print("htmlResultParse" ,type, html.size());
		
	}
	@util.sendPostEvent(type, kind) {
		node=_node();
		if(kind) node.kind=kind;
		Cf.postEvent(type,node);
	}
	// 공통 웹다운로드 처리
	@util.downloadCheck() {
		while(num=0, num<5,  num++ ) {
			web=Baro.web("download-$num");
			arr=web.get("@downloadList");
			if(arr.size() || web.is('run')) return true;
		}
		return false;
	}	
	@util.downloadInit() {
		while(num=0, num<5,  num++ ) {
			web=Baro.web("download-$num")
			arr=web.get("@downloadList");
			if(arr.size()) arr.reuse();
		}
	}
	@util.downloadPush(url, downloadPath, fileName, downloadType, target) {
		fo=Baro.file();
		not(downloadPath) downloadPath="c:/temp/download";
		not(fo.isFolder(downloadPath)) fo.mkdir(downloadPath,true);
		root=object('obj.download');
		not(fileName) fileName=rightVal(url,'/');
		node=root.addNode().with(url, downloadPath, fileName, downloadType);
		if(target) node.targetNode=target;
		idx=Cf.rootNode().incrNum("downloadIndex");
		num=idx%5;
		web=Baro.web("download-$num");
		web.addArray("@downloadList").add(node);
	} 
	@util.downloadStart() {
		while(num=0, num<5,  num++ ) {
			web=Baro.web("download-$num")
			arr=web.get("@downloadList");
			if(arr.size()) { 
				@util.downloadExec(web);
			}
		}
	}
	@util.downloadExec(web) {
		node=web.get("@downloadList").pop();
		not(node) return;
		web.var(currentNode, node);
		node.inject(url, downloadPath, fileName);
		web.download(url, "$downloadPath/$fileName", "GET", @util.downloadProcess );
	}
	@util.downloadProcess(type, data) {
		node=this.var(currentNode);
		if(type=='error') return print("download error node=>$node");
		if(type=='finish') @util.downloadExec(this);
	}
	@util.confValue() {
		switch(args().size()) {
		case 1:
			args(code)
			code.split('.').inject(a,b)
		case 2:
			args(a,b)
		default:
		}
		return Baro.db('config').value("select data from conf_info where grp='$a' and cd='$b'");
	}
</func>