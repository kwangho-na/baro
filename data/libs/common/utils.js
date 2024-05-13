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
	classLoadAll(classPath) {
		not(classPath) {
			path=System.path()
			classPath=Cf.val(path,"/data/libs/classes")
		}
		classLoadPath(classPath)
	}
	classLoadPath(path, pathLen) {
		not(path) return;
		not(pathLen) pathLen=path.size()
		fo=Baro.file()
		fo.list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath, ext)
				if( type=='folder') {
					classLoadPath(fullPath, pathLen)
					continue;
				}
				if(ext.eq('js','src')) {
					src=fileRead(fullPath)
					relative=fullPath.trim(pathLen+1)
					groupId=relative.findPos('.').trim()
					classSource(src, fullPath, groupId)
				}
			}
		});
	}
	classLoad(name ) { 
		path=System.path()
		if(name.ch('/')) {
			ss=name.ref()
			a=ss.findLast('/')
			relative=a.trim();
			name=a.right();
			pathBase=Cf.val(path, relative);
		} else {
			pathBase=Cf.val(path,"/data/libs/classes")
		}
		if(name.find('.')) {
			pathFile="${pathBase}/${name}";
		} else {
			pathFile="${pathBase}/${name}.js";
		}
		print("pathFile == $pathFile")
		not( isFile(pathFile) ) return print("$name class 로딩오류 [$pathFile 파일없음]");
		src=fileRead(pathFile)
		classSource(src,pathFile)
	}
	classSource(src, pathFile, groupId) {
		map=object('map.classes');
		parse = func(&s) {
			while(s.valid() ) {
				c=s.ch()
				if(c.eq(',',';')) {
					s.incr()
					continue;
				}
				not(checkClass(s)) {
					if(s.ch()) {
						line=s.findPos("\n");
						print("class load match error line=$line");
					}
					return;
				}
				s.next().ch()
				className=s.findPos('{',0,1).trim()
				not(className) return;
				if(groupId) {
					mapId="${groupId}/${className}"
				} else {
					mapId=className
				}
				modify=Baro.file().modifyDate(pathFile)
				node=map.get(mapId)
				if( typeof(node,'node') ) {
					if(modify==node.modifyDate ) return node;
				} else {
					node=map.addNode(mapId)
					node.groupId=groupId
					node.name=className
				}
				node.path=pathFile
				node.modifyDate=modify 
				src=s.match(1)
				if(className.eq("func")) {
					Cf.sourceApply("<func>${src}</func>", mapId, true)
				} else {
					conf("class.$className", src, true)
					print("class $className loaded")
				}
			}
		};
		checkClass = func(&s) {
			type=s.move()
			not(type.eq('class')) return false;
			c=s.next().ch()
			while(c.eq('-')) c=s.next().ch()
			if(c.eq('{')) return true;
			return false;
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
	class() {
		if(args().size()==1) {
			args(param)
			if(typeof(param,'node') ) {
				className=param.id
				obj=param
			} else {
				className=param
				obj=object("class.$className")
			}
		} else {
			args(obj,className)
		}
		not(typeof(obj,'node')) return print("class 객체 미설정")
		if( obj.var(useClass) ) return obj
		not(className) return print("class 매개변수 미설정")
		arr=obj.addArray("@classNames")
		if(typeof(className,'array') ) {
			while(name, className) {
				src=conf("class.$name")
				not(src) return print("class $name 클래스 소스 미등록")
				if( arr.find(name)) {
					print("$name 클래스 이미 등록됨")
					continue;
				}
				arr.add(name)
				parse(obj, src)
			}
		} else {
			not(conf("class.$className")) classLoadAll()
			arr.add(className)
			src=conf("class.$className")
			parse(obj, src)
		}
		obj.var(useClass, true)
		return obj;
		
		parse=func(obj, &s) {			
			init='', funcs='';
			n=0;		
			while(s.valid()) {
				if(funcCheck(s)) {
					sp=s.cur()
					s.next().ch()
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
			if(init) {
				src="onInit() {$init}"
				obj[$src]
			}
			if(funcs) {
				obj[$funcs]
			}
		};
		funcCheck = func(&s) {
			not(s.ch()) return false;
			c=s.next().ch()
			if(c.eq('(')) {
				s.match()
				c=s.ch()
				if(c.eq('{')) return true
			}
			return false
		};
	}
	fn(name) {
		fn=Cf.funcNode('parent')
		while(fn) {
			if(fn.isset(name)) return fn;
			fn=fn.parentFunc()
		}
		return;
	}
	fnVal(name) {
		return Cf.funcNode('parent').get(name)
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
	findTag(tag, root) {
		not(root) root=this;
		while( cur, root ) {
			if( cur.cmp("tag", tag) ) return cur;
			if( cur.childCount() ) {
				find=findTag(tag, cur);
				if( find ) return find;
			}
		}
		return null;
	}
	findId(id, root) {
		not(root) root=this;
		while(cur, root) {
			if(cur.cmp("id",id))return cur;
			if( cur.childCount() ) {
				find=findId(id, cur);
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