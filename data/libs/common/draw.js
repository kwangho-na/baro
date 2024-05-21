<func comment="draw 유틸리티 함수">
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

	mdc(code, param) {
		asize=args().size() not(asize) return map;
		map=object("user.mdcMap")
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

</func>

<func>
	@draw.rcCenter(x,y,rw,rh) {
		not(rh) rh=rw;
		x-=rw, y-=rh;
		rw*=2;
		rh*=2;
		return Baro.rc(x,y,rw,rh);
	}
</func>
