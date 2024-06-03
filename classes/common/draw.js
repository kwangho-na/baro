class draw {
	initClass() {
		@dc=null
		@images=_arr('draw.images')
	}
	begin(dc, rc) {
		this.setMemberVar('dc,rect:rc')
	}
	img(name) {
		while(cur, images) {
			if(cur.cmp('name',name)) return cur;
		}
		return;
	}
	drawImg(dc, rc, name) {
		img=this.img(name)
		if(img) {
			dc.image(rc, img)
		}
	}
}
 
 
class func:gui {
	randomColor() {
		hue=System.rand(360).toInt(); 
		return Baro.color('hsl', hue, 100, 100);
	}
	randomIcon() {
		num=System.rand(360).toInt();
		Baro.db('icons').fetch("select type, id from icons where type='vicon' limit $num,1"  ).inject( type, id);
		return "$type.$id";
	}
	rand(min, max) { 
		dist=max-min;
		dist*=Math.random();
		return min + dist
	}
	randInt(min, max) {
		num=Math.floor(rand(min, max+1));
		return num.toInt();
	}
	randItem(list) { return list.get(randInt(0, list.size())) }
}
class func:image {
	imgSize(param) {
		not(param) return pt(0,0);
		if(typeof(param,'size')) return param;
		if(typeof(param,'rect')) return param.size();
		if(typeof(param,'widget')) return param.rect().size();
		if(typeof(param,'image')) return param.imageSize();
		if(typeof(param,'node')) {
			rc=param.var(rect)
			if(rc) return rc.size()
		}
		return pt(0,0);
	}
	mdc(code, param) {
		map=object("user.mdcMap")
		asize=args().size() not(asize) return map;
		d=map.get(code)
		if( asize.eq(1) ) {
			return d;
		}
		img=null
		if(typeof(param,'string')) {
			img=Cf.imageLoad(param)
		} else if(typeof(param,'image')) {
			img=param
		} else if(typeof(param,'node')) {
			img=param.var(image)
		} 
		if(img) {
			if(d) return d;
			d=Baro.drawObject(img)
			d.name=code
			map.set(code, d)
			return d;
		}

		if(typeof(param,'point')) {
			param.inject(width, height);
		} else if(typeof(param,'rect')) { 
			param.size().inject(width, height);
		} else {
			args(1,width, height);
		}
		not(typeof(width,'num') || typeof(height,'num')) return print("메모리 DC생성 영역오류(폭:$width 높이:$height)", param);
		
		if(d) {
			rc=d.rect();
			rc.size().inject(w, h);
			if(width.eq(w) && height.eq(h) ) {
				d.flag(FLAG.new);
				return d;
			}
			d.destroy();
			d.painter(width, height);
			print("mdc set ($width, $height)");
		} else {
			d=Baro.drawObject(width, height);
			d.name=code;
			map.set(code, d);
		}  
		d.var(first,true);
		return d;
	}	 
	@draw.loadImages(path) {
		_load=func(path, pathLen) {
			not(path) {
				path=conf("path.images")
				pathLen=path.size()
			}
			fp=Baro.file()
			fp.list(path, func(info) {
				while(info.next()) {
					info.inject(type,name,fullPath,ext)
					if( type.eq('folder')) {
						not(name.eq('icons')) {
							_load(fullPath, pathLen)
						}
						continue;
					}
					if( ext.ne('png') ) {
						continue;
					}
					relative=fullPath.value(pathLen+1)
					code=left(name,'.') 
					mdc(code, relative)
				}
			});
		};
		return _load(path);
	}
}
class func:rect { 
	containsRect(r1, r2) {
		if(r1.eq(r2)) return true;
		r1.inject(x,y,w,h)
		r2.inject(x1,y1,w1,h1)
		r=x+w, b=y+h;
		r1=x1+w1, b1=y1+h1;
		c0=x.lt(x1) && y.lt(y1)
		c1=r.gt(r1) && b.gt(b1)
		return c0 && c1;
	} 
	
	toRect(rc) {
		rc.inject(x,y,w,h);
		return Baro.rect(x,y,w,h);
	}
	toRc(rc) {
		rc.inject(x,y,w,h);
		return Baro.rc(x,y,w,h);
	} 
	point(param) {
		if(typeof(param,'rect')) {
			return param.lt();
		} else if(typeof(param,'point')) {
			return param;
		} else if(typeof(param,'num')) {
			args(width, height);
			return Baro.point(width, height);
		}
		return Baro.point(0,0);
	} 
	mergeRect() {
		cx=0,cy=0,cr=0,cb=0;
		while(rc, args(), idx) {
			rc.inject(x,y,w,h);
			r=x+w, b=y+h;
			if(idx==0) {
				cx=x,cy=y,cr=r,cb=b;
			} else {
				if(x<cx) cx=x;
				if(y<cy) cy=y;
				if(cr<r) cr=r;
				if(cb<b) cb=b;
			}
		}
		w=cr-cx;
		h=cb-cy;
		return rc(cx, cy, w, h)
	}
	@draw.rectArray(rc,cx,cy,iw,ih,num) {
		arr=[]
		rc.inject(x,y,w,h)
		th=ih*num
		gap=h - th;
		gap/=num-1;
		if(gap>0 ) {
			while(n=0, num) {
				rcImg=rc(cx, cy, iw, ih)
				cy+=ih;
				cy+=gap;
				arr.add(rcImg)
			}
		}
		return arr;
	}
	@draw.textSize(str, fontInfo) {
		dc=mdc('text',1000,100)
		dc.font(fontInfo)
		return dc.textSize(str)
	}
	@draw.vbox(rc, info, padding, gap, mode) {
		arr=[]
		a=_arr()
		total=rc.height()
		a.div(info,total)
		gg=0;
		if(gap) {
			not(mode) mode='around'
			last=a.size()-1;
			if(mode.eq('around')) {
				gg=gap/2;
				tg=gap*last
			} else {
				xx=last-1
				tg=gap*xx
			}
			total-=tg;
			if(total.lt(last)) {
				total=last
			}
			a.reuse()
			a.div(info,total)
		}
		pa=null
		if(padding) {
			if(typeof(padding,'array')) {
				pa=padding
			} else if(typeof(padding,'string')) {
				if(padding.find(',')) pa=padding.split(',')
			}
		}
		rc.inject(x,y,w,h)
		cx=x, cw=w;
		cy=y;
		if(gg) cy+=gg;
		while(n=1,a.size()) { 			
			d=a.dist(n-1,1)
			rc=rc(cx,cy,cw,d)			
			if(pa) {
				y=cy+d;
				switch(pa.size()){
				case 2:
					pa.inject(a,b)
					cx+=a;
					cw-=2*a;
					cy+=b;
					d-=2*b;
				case 4:
					pa.inject(a,b,c,d)
					cx+=a;
					cy+=b;
					cw-=c;
					d-=d;
				default:
				}
				rc=rc(cx,cy,cw,d)
				cy=y;
			} else {
				if(padding) {
					rc.incr(padding)
				}
				cy+=d;
			}
			if(gap) cy+=gap;
			arr.add(rc)
		}
		return arr;
	}
	@draw.hbox(rc, info, padding, gap, mode) {
		arr=[]
		a=_arr()
		total=rc.width()
		a.div(info,total)
		gg=0;
		if(gap) {
			not(mode) mode='around'
			last=a.size()-1;
			if(mode.eq('around')) {
				gg=gap/2;
				tg=gap*last
			} else {
				xx=last-1
				tg=gap*xx
			}
			total-=tg;
			if(total.lt(last)) {
				total=last
			}
			a.reuse()
			a.div(info,total)
		}
		pa=null
		if(padding) {
			if(typeof(padding,'array')) {
				pa=padding
			} else if(typeof(padding,'string')) {
				if(padding.find(',')) pa=padding.split(',')
			}
		}
		rc.inject(x,y,w,h)
		cx=x, cy=y, ch=h;
		if(gg) cx+=gg; 
		while(n=1,a.size()) {
			d=a.dist(n-1,1)
			rc=rc(cx,cy,d,ch)
			if(pa) {
				x=cx+d;
				switch(pa.size()){
				case 2:
					pa.inject(a,b)
					cx+=a;
					d-=2*a;
					cy+=b;
					ch-=2*b;
				case 4:
					pa.inject(a,b,c,d)
					cx+=a;
					cy+=b;
					d-=c;
					ch-=d;
				default:
				}
				rc=rc(cx,cy,d,ch)
				cx=x
			} else {
				if(padding) {
					rc.incr(padding)
				}
				cx+=d
			} 
			if(gap) cx+=gap
			arr.add(rc)
		}
		return arr;
	}
}
class func:position {
	@draw.arr(type, num, baseSize) {
		a=[]
		step=1.59/num;
		sp=0.0;
		while(n=0, num) {
			sp+=step
			switch(type) {
			case sin: x=Math.sin(sp)
			case cos: x=Math.cos(sp)
			case tan: x=Math.tan(sp)
			case atan: x=Math.atan(sp)
			default: x=n
			}
			if(baseSize) x*=baseSize;
			a.add(x)
		}
		return a;
	}
	
	@draw.rangeInfo(&s, gap, mode) {
		not(s.ch()) return;
		sp=s.cur()
		ss=''
		while(s.valid()) {
			v=s.findPos(',')
			c=v.ch()
			if(c.eq('*','#')) {
				if(ss) ss.add(',')
				ss.add('*')
				continue;
			}
			if(v.find('*')) {
				sa=v.findPos('*').trim(), sb=v.trim()
				not(typeof(sb,'num')) print("range info error [$sa, $sb 가 올바른 형식이 아닙니다]")
				while(n=0,sb) {
					if(n) {
						ss.add(',')
					} else {
						if(ss) ss.add(',')
					}
					ss.add(sa,'px')
				}
			} else {
				val=v.trim()
				if(ss) ss.add(',')
				ss.add(val,'px')
			}
		}
		if(typeof(gap,'num')) return @draw.marginInfo(ss, gap, mode);
		return ss;
	}
	@draw.marginInfo(&s, gap, mode) {
		not(typeof(gap,'num')) return s;
		gg=gap*2;
		ss='';
		while(s.valid(), n) {
			v=s.findPos(',')
			if(v.find('px')) {
				val=v.findPos('px').trim()
			} else {
				val=v.trim()
			}
			if(val.eq('*','#')) {
				if(n) ss.add(',')
				ss.add('*')
				continue;
			}
			c=s.ch()
			if( mode.eq('start') ) {
				if( n.eq(0)) {
					val+=gap;
				} else if(c) {
					val+=gg;
				}
			} else {
				val+=gg;
			}
			if(n) ss.add(',')
			ss.add(val,'px')
		}
		return ss;
	}
}
