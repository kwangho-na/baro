<func note="위젯함수"> 
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
	widgetMove(parent, widget, rect) {
		if(typeof(rect,"rect") ) {
			widget.rectClient=rect; 
		} else {
			rect=widget.rectClient;
		}
		rcGeo=parent.mapGlobal(rect);
		widget.move(rcGeo);
	}
	widgetAdd(parent, widget) {
		arr=parent.addArray("@widgetList");
		while(cur, arr) {
			if(cur==widget) return widget;
		}
		arr.add(widget);
		return widget;
	}
	widgetHideAll(page) {
		layout=findLayout(page)
		if(layout) layout.hideAll(); 
	}
	widgetShowAll(page) {
		layout=findLayout(page)
		if(layout) layout.showAll(); 		
	}
	widgetMargin(page, param) {
		layout=findLayout(page)
		not(layout) return print("margin layout find error");
		switch(args().size()) {
		case 2: layout.margin(param);
		case 3: 
			args(a,b)
			layout.margin(a,b,a,b);
		case 5:
			args(a,b,c,d)
			layout.margin(a,b,c,d);
		}
	}
	hideLayout(page) {
		layout=findLayout(page)
		if(layout) layout.hide();
	}
	showLayout(page) {
		layout=findLayout(page)
		if(layout) layout.show();
	}
	formCheck(&s) {
		form=this.addNode("@form");
		while(name, s.split()) {
			if(name.find(':')) {
				key=leftVal(name);
				msg=rightVal(name);
			} else {
				key.name;
				msg="";
			}
			w=this.member("$key");
			if(typeof(w,"widget")) {
				val=w.value();
				if( msg && ~(val)) {
					this.alert(msg);
					System.sleep(100);
					w.focus();
					return;
				}
				form.set(key,val);
			}
		}
		return form;
	}
	newWidget(widget, id ) {
		tag=widget.get("tag");
		not(tag) return print("new widget error (태그가 정의되지 않았습니다)");
		src=widget.var(source);
		not(src) return print("new widget error ($tag $id 위젯소스가 없습니다)");
		base=leftVal(widget.var(baseCode),":");
		widgetSource=getSource(src);
		Cf.sourceApply(#[<pages base="${base}">${widgetSource}</pages>]);
		return Cf.getObject(tag, "$base:$id");
		
		getSource=func(&s) {
			c=s.ch();
			not(c.ch('<')) return print("위젯소스 시작오류 소스:$s");
			ss=s.match("<$tag","</$tag>");
			if(typeof(ss,'bool')) return print("위젯소스 매칭오류 태그:$tag")
			prop=ss.findPos(">");
			rst="<$tag";
			rst.add( " id=",Cf.jsValue(id));
			rst.add(getProp(prop) );
			rst.add(">$ss</$tag>");
			return rst;
		};
		getProp=func(&s) {
			rst='';
			while(s.valid()) {
				not(s.ch()) break;
				k=s.move();
				c=s.ch();
				if(c.eq('=')) {
					c=s.incr().ch();
					if(c.eq()) v=s.match() else v=s.findPos(" \t\n",4).trim();
					if(k.eq('mode','id') ) continue;
					rst.add(" $k=",Cf.jsValue(v));
				} else if(c.eq('(')) {
					fparam=s.match();
					not(s.ch('{')) break;
					fsrc=s.match();
					rst.add(" $k","($fparam) {$fsrc}")
				} else {
					break;
				}
			}
			return rst;
		};
	}
	widgetPositionSave(code) {
		page=this;
		not(code) return;
		page.geo().inject(x,y,w,h);
		y-=31;
		conf("pagePosition.${code}", "$x,$y,$w,$h", true);
	}
	widgetPositionLoad(page) {
		page=this;
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
	
</func>