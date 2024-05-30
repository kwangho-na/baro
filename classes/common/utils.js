class utils {
	isClass(name) {
		map=object('map.classes')
		node=class('nodes').findName(map, name)
		return typeof(node,'node')
	}
	isFunc(name) {
		return object('@inc.userFunc').get(name)
	}
	loadClass() {
		classLoadAll()
	}
}
/* 
	공통 유틸리티함수
*/
class func:common {
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
	
}

/*
	영역처리 함수
*/
class func:range {
	randomColor() {
		hue=System.rand(360).toInt(); 
		return Baro.color('hsl', hue, 100, 100);
	}
	randomIcon() {
		num=System.rand(360).toInt();
		Baro.db('icons').fetch("select type, id from icons where type='vicon' limit $num,1"  ).inject( type, id);
		return "$type.$id";
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
}

/* 
	배열/노드처리 공통함수
*/
class func:object {
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
	setArray(arr, idx, node) {
		not(typeof(idx,"num")) return arr;
		if(idx.lt(arr.size()) ) {
			arr.set(idx, node);
		} else {
			arr.add(node);
		} 
		return arr;
	}	
	arrayFind(arr, key) {
		not(typeof(arr,'array')) return false;
		idx=arr.find(key);
		return idx.ne(-1);
	}
}

/* 
	파일시스템 관리 함수
*/
class func:filesystem {
	copyFile(src, dest) {
		fo=Baro.file('util');
		path=leftVal(dest,'/');
		not(fo.isFolder(path)) return print("$dest 복사 경로가 폴더가 아닙니다");
		not(fo.isFile(src)) return print("복사대상파일이 없습니다 (파일:$src)");
		not(fo.copy(src, dest)) return print("$src 에서 $dest 복사실패");
	}
	deleteFiles(path) {
		fp=Baro.file()
		fp.list(path, func(info) {
			while(info.next()) {
				info.inject(type,fullPath)
				if(type=='file') fp.delete(fullPath)
			}
		})
	}
	localPath(path, make) {
		if( path ) {
			ch=path.ch(1);
			if( path.ch('/') || ch.eq(':') ) {
				return path;
			}
			path=System.filePath(path,make);
			return path;
		}
	}	 
	relativePath(base, path) {
		if(base ) {
		  base=base.trim();
		} else {
		  base=System.path();
		}
		not(path ) return base;
		while( path.ch('.') ) {
		  ch=path.ch(1);
		  if( ch.eq('/') ) {
			// 경로 ./ 처리
			path=path.value(2);
		  } else if( ch.eq('.') ) {
			// 경로 ../../ 처리
			ch=path.ch(2);
			if( ch.eq("/") ) {
			  path=path.value(3);
			  not( base.find("/") ) return print("[relativePath] 기준경로 오류 (base:$base)");
			  base=base.findLast("/").trim();
			} else {
			  return print("[relativePath] 경로오류 (path:$path)");
			}
		  }
		}
		return "$base/$path";
	}
	isFile(fileName) {
		return Baro.file().isFile( fileName );
	}
	isFolder(path, checkMake) {
		fo=Baro.file();
		fullPath=localPath(path);
		folder=fo.isFolder(fullPath);
		not(folder) {
			if(checkMake) {
				fo.mkdir(fullPath, true);
				folder=fo.isFolder(fullPath);
			}
		}
		return folder;
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
}

 