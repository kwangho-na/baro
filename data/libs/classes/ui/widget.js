class func {
	@widget.eventBase() {
		fn=Cf.funcNode()
		if( fn.eventFuncList()) {
			fn.callFuncSrc()
		}
	}
	@widget.idList(page) {
		arr=page.addArray('@idList')
		find=func(root) {
			while(cur, root) {
				if(cur.id) arr.add(cur)
				if(cur.childCount()) find(cur)
			}
		}
		find(page)
		return arr;
	}
	@widget.idFind(page, id) {
		arr=page.get('@idList')
		not(arr) arr=@widget.idList(page)
		while(cur,arr) {
			if(cur.cmp('id',id)) return cur;
		}
		return;
	}
	@page.margin() {
		page=this
		box=page.child(0)
		tag=box.tag
		not(tag.eq('vbox','hbox','form')) return print("page margin 오류 레이아웃 미정의");
		switch(args().size()) {
		case 1:
			args(a)
			box.margin(a)
		case 2:
			args(a,b)
			box.margin(a,b,a,b)
		case 4:
			args(a,b,c,d)
			box.margin(a,b,c,d)
		}
	}
}
class widget {
	addChild() {
		print("widget add child")
	}
	base() {
		base=this.var(baseCode)
		not(base ) base
		return when(base.find(':'), left(base,':'), base);
	}
	conf(name) {
		base=this.base()
		return conf("${base}.${name}")
	}
	injectVar(&s) {
		fn=Cf.funcNode('parent')
		while(s.valid()) {
			left=s.findPos(',')
			not(left.ch()) break;
			name=left.findPos(':').trim()
			if(left.ch()) {
				id=left.trim()
			} else {
				id=name
			}
			fn.set(name, findId(this,id))
		}
	}
	setEvent(param) {
		if(typeof(param,'string')) {
			args(fnm, fc)
			fn=this.get(fnm)
			if(typeof(fn,'func')) {
				if(fn.isset('eventUse')) {
					not(fc) return;
				} else {
					not(typeof(fc,'func')) fc=fn
					this.set(fnm, call(@widget.eventBase))
					fn=this.get(fnm)
					fn.set('eventUse', true)
				}
				if(typeof(fc,'func')) {
					fn.addFuncSrc(fc)
				}
			} else {
				this.set(fnm, call(@widget.eventBase))
				fn=this.get(fnm)
				fn.set('eventUse', true)
				if(typeof(fc,'func')) {
					fn.addFuncSrc(fc)
				}
			}
			print("set event $fnm", fc)
			return;
		}
		
		if(typeof(param,'node')) {
			for(fnm, param.keys()) { 
				fc=param.get(fnm)
				if(typeof(fc,'func')) {
					this.setEvent(fnm, fc)
				}
			}
		}
	}
	applyWidget(src, id) {
		base=this.base()
		ss=format(src, id)
		Cf.sourceApply(#[
			<widgets base="${base}">${ss}</widgets>
		])
	}
}

class page {
	class(this, 'widget')
	page=this
	positionSave() {
		code=this.var(baseCode)
		page=this;
		not(code) return;
		page.geo().inject(x,y,w,h);
		y-=31;
		conf("pagePosition.${code}", "$x,$y,$w,$h", true)
	}
	positionLoad() {
		page=this
		code=this.var(baseCode)
		s=conf("pagePosition.${code}");
		w=800, h=600;
		not(s) {
			return page.move( System.info("screenRect").center(w,h) );
		}
		s.ref();
		x=0, y=0;
		while(s.valid(),n) {
			not(s.ch()) break;
			v=s.findPos(",").trim()
			not(typeof(v,"num")) break;
			switch(n) {
			case 0: x=v.toInt();
			case 1: y=v.toInt();
			case 2: w=v.toInt();
			case 3: h=v.toInt();
			}
		}
		cnt=System.info("screenCount");
		while(n=0,n<cnt,n++) {
			rcScreen=System.info("screenRect",n);
			if( containsRect(rcScreen,rc)) {
				return page.move(x,y).size(w,h);
			}
		}
		page.move( System.info("screenRect").center(w,h) ); 
		page.active();
	}
}