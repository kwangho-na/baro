class draw {
	dc=null
	images=_arr('draw.images')
	initClass() {
		not(images.size()) { 
			@draw.loadImages()
			map=object("user.mdcMap")
			while(key, map.keys() ) {
				images.add(map.get(key))
			}
		}
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




class func { 
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
	@draw.loadImages(path) {
		_load=func(path, pathLen) {
			not(path) {
				path=Cf.val(webRoot(),'/images')
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
					print("xxxxx", code, relative)
					mdc(code, relative)
				}
			});
		};
		return _load(path);
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
