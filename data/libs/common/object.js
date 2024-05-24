<func note="기본객체">
	color(param) {
		if(param.ch('#')) {
	 		return Baro.color(param.trim()); 
	 	} 
		switch(args().size()) {
		case 1:
			args(&s);
			type=s.findPos("(").trim();
			if(s.valid()) {
				r=0,g=0,b=0,a=255;
				ss=s.findPos(")");
				while(ss.valid(), idx) {
					left=ss.findPos(",");
					if(left.find('%')) {
						v=left.findPos("%").trim();
					} else {
						v=left.trim();
					}
					not(typeof(v,'num')) v=0;
					switch(idx) {
					case 0: r=v.toInt();
					case 1: g=v.toInt();
					case 2: b=v.toInt();
					case 3: a=v*256.0;
					}
				}
				c=Baro.color(type,r,g,b,a);
			} else {
				c=Baro.color('hsv',type, 100, 50)
			}
			return c;
		case 3:
			args(r,g,b)
			return Baro.color(r,g,b);
		case 4:
			args(r,g,b,a)
			return Baro.color(r,g,b,a);
		default:
		}
	}
	size(param) {
		if(typeof(param,'array')) return param.size();
		result=null;
		if(typeof(param,'rect')) {
			result=param.size();
		} else if(typeof(param,'widget')) {
			result=param.rect().size();
		} else if(typeof(param,'node')) {
			if(param.var(rect)) {
				result=param.var(rect).size();
			} else {
				return param.childCount();
			}
		} else {
			if(typeof(param,'string')) {
				return param.size();
			} else if(typeof(param,'num')) {
				return param;
			}
		}
		if(args().size()==2) {
			result.inject(width);
			return width;
		}
		return result;
	}
	pt(param) {	
		if( typeof(param,'point') ) {
			args(pt, pos);
			pt.inject(x,y);
			if( typeof(pos,'point') ) {
				args(2, chk);
				param.inject(x,y);
				pos.inject(dx, dy);
			} else {
				args(1, dx, dy, chk);
			}		
			if(chk) {
				x-=dx, y-=dy;
			} else {
				x+=dx, y+=dx;
			}
			return Baro.point(x, y);
		}
		sz=args().size();
		not(sz) return Baro.pt(0,0);	
		ty=typeof(param);
		if( sz.eq(1) ) {
			if( ty.eq('rect','point','rectf','pointf') ) {			
				param.inject(x,y);
			} else if( ty.eq('node(draw)') ) {
				param.rect().inject(x,y);
			}
		} else if( ty.eq('rect','rectf','node(draw)') ) {
			x=0, y=0;
			if(ty.eq('node(draw)') ) {
				args(dc,ty);
				rc=dc.rect();
			} else {
				args(rc, ty);
			}
			switch(ty) {
			case lt: rc.inject(x,y)
			case lb: rc.lb().inject(x,y)
			case rt: rc.rt().inject(x,y)
			case rb: rc.rb().inject(x,y)
			case tc: rc.tc().inject(x,y)
			case bc: rc.bc().inject(x,y)
			case center: rc.center().inject(x,y);
			default: rc.inject(x,y);
			}
			if(sz>2) {
				args(2,dx, dy);
				if( typeof(dx,'num') ) x+=dx;
				if( typeof(dy,'num') ) y+=dy;
			}
		} else if(typeof(param,'num') ) {
			args(x,y);
			not(typeof(y,'num') ) y=0;	
		}
		return Baro.pt(x,y);
	}   
	rc() {
		x=0,y=0;
		switch(args().size()) {
		case 0:
			this.rect().inject(x,y,w,h);
		case 1:
			args(param);
			if( typeof(param,'string') ) {
				use(rectMap);
				rc=rectMap.get(param);
				if(typeof(rc,'rect')) return rc;
				item=findId(rectMap, param);
				return when(item, item.rc);
			}
			if( typeof(param,"node") ) {
				if(typeof(param.rc,'rect')) return param.rc;
				param.rect().inject(x,y,w,h);
				return Baro.rc(x,y,w,h);
			}
			ty=typeof(param);
			if( ty.eq('rect','rectf','point','pointf') ) {
				if( ty.eq('rect', 'rectf') ) {
					param.inject(x,y,w,h);
				} else {
					x=0,y=0;
					param.inject(w,h)
				}
			} else if( ty.eq() ) {
				if( ty.eq('rectf') ) {
					param.inject(x,y,w,h);
				} else {
					x=0,y=0;
					param.inject(w,h)
				}
			} else if( ty.eq('image','png') ) {
				param.imageSize().inject(w,h);
			} else {
				w=100, h=100;
			}
		case 2:
			args(w,h);
			if(typeof(w,'string') && typeof(h,'rect')) {
				use(rectMap);
				if(rectMap) {
					rc=h;
					rectMap.set(w,rc);
					return rc;
				}
				return;
			}
			if(typeof(w,"node","widget")) {
				args(node, id);
				map=node.rectMap;
				if(map) {
					cur=map.get(id);
					if(typeof(cur,'rect')) return cur;
					else if(typeof(cur,'node')) return cur.rc;
				} else {
					cur=findId(node,id);
				}
				if(typeof(cur,'rect')) return cur;
				return when(cur, cur.rc);
			}
			not(typeof(w,'num') ) w=100;
			not(typeof(h,'num') ) h=100;
		case 3:
			args(param)
			if(typeof(param,'rect') ) {
				args(1, type, pos);
				param.inject(x,y,w,h);
				if(type.eq('bottom')) {
					pos-=y;
					return Baro.rc(x,y,w,pos);
				} 
				if(type.eq('right')) {
					pos-=x;
					return Baro.rc(x,y,pos,h);
				}
				return (x,y,w,h);
			} 
			if(typeof(param,'num') ) {
				args(x,y,size);
				size.inject(w,h);
			} else {
				args(point, w,h);
				point.inject(x,y);
				hw=w/2, hh=h/2;
				x-=hw, y-=hh;
			}
		case 4:
			args(x,y,w,h);
			if(typeof(x,'point')) {
				ty=y;
				x.inject(x,y);
				switch(ty) {
				case lb:
					y-=h;
				case rt:
					x-=w;
				case rb:
					x-=w;
					y-=h;
				case bc:
					hw=w/2.0;
					x-=hw;
					y-=h;
				case tc:
					hw=w/2.0;
					x-=hw;
				case lc:
					hh=h/2.0;
					y-=hh;
				case rc:
					hh=h/2.0;
					x-=w;
					y-=hh;
				default:			
				}
			}
		case 5:
			args(x,y,right,bottom);
			w=right-x;
			h=bottom-y;
			if(w<0) w=1;
			if(h<0) h=1;
		default:
			w=100, h=100;
		}	
		return Baro.rc(x,y,w,h);
	}
</func>

<func note="객체함수">
	objectFunc(obj, src, reload) {
		if(reload) obj.var(objectFuncCheck,false);
		if(obj.var(objectFuncCheck)) return obj;
		obj.var(objectFuncCheck, true);
		obj[$src];
		return obj;
	}
</func>

<func note="공통함수">
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
	
</func>

<func note="로그처리">
logClass(name, fileName) {
	not( name ) name="baro";
	log=Cf.getObject("log",name);
	if( log ) {
		return log;
	}
	log=Cf.getObject("log", name, true);
 	date=System.date("yyyyMMdd");
	if( fileName ) {
		logFileName=localPath(fileName,true);
	} else {
		if(name.eq("baro")) {
			logFileName=System.filePath("data/logs/log-${date}.log", true);
		} else {
			logFileName=System.filePath("data/logs/${name}-${date}.log", true);
		}
	}
	not( isFile(logFileName) ) {
		fileWrite(logFileName, "== $name 로그시작 ==\n");
	}
	log[
		onInit() {
			name=funcNode.get("name");
			logFileName=funcNode.get("logFileName");			
			fileLogReader=Baro.file("logRead_$name"); 
			startTime=System.localtime();
			lastReadCheck=false;
			status=0;
			logTick=0;
			fileCurrentPos=0;
			lastRead=false;
		}	
		timeout() {
			not( startTime ) return;
			switch( status ) {
			case 0: 
				if( fileLogReader.open() ) {
					this.member(status, 1);
					return;
				}
				if( fileLogReader.open(logFileName) ) {
					this.member(status,1);
					return true;
				}
				return false;
			case 1:
				not( fileLogReader.open() ) {
					this.member(status,0);
					return;
				}
				size=fileLogReader.size();
				startPos=when( size.gt(1024), size-1024, 0 );
				fileLogReader.seek(startPos);
				this.member(fileCurrentPos, size);
				this.member(status, 2);
				return fileLogReader.read();
			case 2:
				not( fileLogReader.open() ) {
					this.member(status, 0);
					return;
				}
				size=fileLogReader.size();
				if( size.eq(fileCurrentPos) ) return;
				if( size.lt(fileCurrentPos) ) {
					this.member(fileCurrentPos, size);
					return print("파일위치 다시 설정", size, fileCurrentPos);
				}
				fileLogReader.seek(fileCurrentPos);
				this.member(fileCurrentPos, size);
				return fileLogReader.read();
			default:
			}
			return null;
		}
		closeLog() {
			if( fileLogReader.open() ) fileLogReader.close();
			this.member(status, 0);
			this.member(startTime, 0);
		}
	];
	log.timeout();
	return log;
}
logWriter(name) {
	not( name ) name="baro";
	log=Cf.getObject("logWriter",name);
	if( log ) {
		return log;
	}
	log=Cf.getObject("logWriter", name, true);
 	date=System.date("yyyyMMdd");
	if(name=='didCommand') {
		logFileName=System.filePath("data/logs/didCommand.log", true);
	} else {
		logFileName=System.filePath("data/logs/${name}-${date}.log", true);
	}
	log[
		onInit() {
			name=funcNode.get("name");
			logFileName=funcNode.get("logFileName");
			fileLogAppend=Baro.file("logAppend_$name");
			startTime=System.localtime();
		}	
		appendLog(data, skip) {
			not( fileLogAppend.open() ) {
				not( fileLogAppend.open(logFileName,'append') ) return print("로그파일 첨부오류 (파일명:$logFileName)");
			}
			if( skip ) return fileLogAppend.append(data);
			fileLogAppend.append("# $data\n");
			fileLogAppend.flush();
		}
		write(data) {
			fileLogAppend.append(data);
			fileLogAppend.flush();
		}
		closeLog() {
			if( fileLogAppend.open() ) fileLogAppend.close();
			this.member(status, 0);
			this.member(startTime, 0);
		}
	];
	return log;
}
</func>