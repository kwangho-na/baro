class func {
	widget(tag, name, parent) {
		not(name) {
			p=this.parentWidget()
			return when(p, p.pageNode(), this.pageNode());
		}
		not(name.find(':')) {
			base=this.var(baseCode)
			if(base) {
				name=Cf.val(left(base,':'),':', name)
			} else {
				name=Cf.val('test:',name)
			}
		}
		obj=Cf.getObject(tag, name) not(obj) return print("$name $tag 오류");
		if(typeof(obj,'widget')) {
			not(obj.var(useClass)) {
				class(obj,'widget')
			}
		}
		if(typeof(parent,'widget')) {
			obj.parentWindow(parent)
		}
		return obj;
	}
	page(name, parent) {
		return widget('page', name, parent)
	} 
	widgetSub(parent, widget, rect) {
		not(typeof(widget,"widget") ) return print("widgetSub widget error", args());
		widget.parentWidget(parent);
		widget.flags("child");
		widgetAdd(parent, widget);
		if(typeof(rect,"rect") ) {
			rcGeo=parent.mapGlobal(rect);
			widget.rectClient=rect;
			widget.move(rcGeo);
			widget.show();
		}
		return widget;
	}
	@widget.test(id, tag) {
		not(id) id='p1'
		not(tag) tag='grid'
		Cf.sourceApply(#[
			<widgets base="test">
				<page id="${id}">
					<${tag} id="${tag}">
					<hbox id="buttonsBar">
					</hbox>
				</page>
			</widgets>
		])
		return page("test:$id")
	}
	@widget.find(base, id) {
		_find=func(&s) {
			s.findPos('.')
			if(s.start(base,true)) {
				if(s.ch(':')) {
					name=s.incr().trim()
					if(name.eq(id)) return true;
				}
			}
			return false;
		};
		root=Cf.getObject()
		while(name, root.keys()) {
			if(_find(name)) return root.get(name);
		}
		return;
	}
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
	@widget.varValue(obj,param,nullCheck) {
		code="@$param"
		val=obj.get(code) 
		if(nullCheck) obj.set(code,null)
		return val;
	}
	@page.margin(page) {
		box=page.child(0)
		tag=box.tag
		not(tag.eq('vbox','hbox','form')) return print("page margin 오류 레이아웃 미정의");
		switch(args().size()) {
		case 2:
			args(1,a)
			box.margin(a)
		case 3:
			args(1,a,b)
			box.margin(a,b,a,b)
		case 5:
			args(1,a,b,c,d)
			box.margin(a,b,c,d)
		}
	}
	@page.spacing(page, num) {
		not(num) num=0
		box=page.child(0)
		tag=box.tag
		not(tag.eq('vbox','hbox','form')) return print("page margin 오류 레이아웃 미정의");
		box.spacing(num)
	}
}
class widget {
	base() {
		base=this.var(baseCode)
		not(base) {
			page=this.pageNode()
			base=page.var(baseCode)
		}
		return when(base.find(':'), left(base,':'), base);
	}
	conf(name) {
		base=this.base()
		return conf("${base}.${name}")
	}
	addWidget(tag, name) {
		base=this.base()
		widget=Cf.getObject(tag, "$base:$name")
		not(widget) return print("$name 위젯 미정의 (addChild 오류)")
		arr=this.member(widgetList)
		not(arr) {
			page=page('main')
			not(page) page=this.pageNode()
			arr=page.addArray('@widgetList')
			this.member(widgetList, arr)
		}
		while(cur, arr) {
			if(cur.cmp('id',name)) return cur;
		}
		arr.add(widget)
		widget.parentWidget(this)
		widget.flags("child")
		return arr;
	}
	getWidget(id) {
		obj=this.get(id)
		not(typeof(obj,'widget')) {
			arr=this.member(widgetList)
			if(arr) {
				while(cur, arr) {
					if(cur.cmp('id',id)) {
						obj=cur
						break;
					}
				}
			}
			not(obj) {
				base=this.base()
				obj=@widget.find(base,id);
			}
		}
		if(typeof(obj,'widget')) {
			not( obj.var(useClass)) {
				class(obj, 'widget')
				tag=obj.tag
				if(tag.eq('canvas','context')) {
					class(obj, 'draw')
				}
			}
		}
		return obj;
	}
	widgetMove(widget, rect) {
		if(typeof(rect,"rect") ) {
			widget.rectClient=rect; 
		} else {
			rect=widget.rectClient;
		}
		rcGeo=this.mapGlobal(rect);
		widget.move(rcGeo);
	}
	injectVar(param) {
		fn=Cf.funcNode('parent')
		page=this;
		if(typeof(param,'widget')) {
			args(1,&s)
			page=param
		} else {
			args(&s)
		} 
		while(s.valid()) {
			left=s.findPos(',')
			not(left.ch()) break;
			name=left.findPos(':').trim()
			if(left.ch()) {
				id=left.trim()
			} else {
				id=name
			}
			val=page.member(id) 
			not(val) val=findId(this,id)
			fn.set(name, val)
		}
	}
	setMemberVar(param) {
		fn=Cf.funcNode('parent')
		page=this;
		if(typeof(param,'widget')) {
			args(1,&s)
			page=param
		} else {
			args(&s)
		} 
		while(s.valid()) {
			left=s.findPos(',')
			not(left.ch()) break;
			name=left.findPos(':').trim()
			if(left.ch()) {
				id=left.trim()
			} else {
				id=name
			}
			page.member(name, fn.get(id))
		}
	}
	setEvent(param) {
		if(typeof(param,'string')) {
			args(fnm, fc, thisNode)
			fn=this.get(fnm)
			print("@@@@@@@@@ set event $fnm @@@@@@@@@", fn)
			if(typeof(fn,'func')) {
				if(fn.isset('eventUse')) {
					not(fc) return;
				} else {
					not(typeof(fc,'func')) fc=fn
					this.set(fnm, call(@widget.eventBase))
					fn=this.get(fnm)
					fn.set('eventUse', true)
					if(typeof(thisNode,'node')) {
						fn.set("@this",thisNode)
						fn.set("target",this)
					}
				}
				if(typeof(fc,'func')) {
					fn.addFuncSrc(fc)
				}
			} else {
				fn=call(@widget.eventBase)
				this.set(fnm, fn)
				if(typeof(thisNode,'node')) {
					fn.set("@this",thisNode)
					fn.set("target",this)
				}
				fn.set('eventUse', true)
				if(typeof(fc,'func')) {
					fn.addFuncSrc(fc)
				}
			}
			print("set event $fnm", fc)
			return;
		}
		
		if(typeof(param,'node')) {
			args(1,thisNode)
			for(fnm, param.keys()) { 
				fc=param.get(fnm)
				if(typeof(fc,'func')) {
					this.setEvent(fnm, fc, thisNode)
				}
			}
		}
	}
	makePage(code, pageId) {
		base=this.base()
		src=this.conf(code)
		ss=format(, pageId)
		Cf.sourceApply(#[
			<widgets base="${base}">${ss}</widgets>
		])
		return page(pageId)
	}
}

class page {
	class(this,'widget')
	page=this
	positionSave() {
		code=page.var(baseCode)
		not(code) return;
		page.geo().inject(x,y,w,h);
		y-=31;
		conf("pagePosition.${code}", "$x,$y,$w,$h", true)
	}
	positionLoad(w,h) {
		code=page.var(baseCode)
		if(page.parentWidget()) {
			return;
		}
		not(code) return;
		s=conf("pagePosition.${code}")
		not(w) w=800
		not(h) h=600
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
		rc=rc(x,y,w,h)
		while(n=0,System.info("screenCount")) {
			rcScreen=System.info("screenRect",n);
			if( rcScreen.contains(rc) ) {
				return page.move(x,y).size(w,h);
			}
		}
		 
		page.move( System.info("screenRect").center(w,h) ); 
		page.active();
	}
}