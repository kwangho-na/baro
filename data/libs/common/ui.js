<func note="영역함수">
@rect.move(rc, offset, ty) {
	rc.inject(x,y,w,h);
	offset.inject(dx,dy);
	switch(ty) {
	case left:
		x-=dx;
	case top:
		y-=dy;
	case right:
		x+=dx;
	case bottom:
		y+=dy;
	case lt:
		x-=dx;
		y-=dy;
	case lb:
		x-=dx;
		y+=dy;
	case rt:
		x+=dx;
		y-=dy;
	case rb:
		x+=dx;
		y+=dy;
	} 
	return rc(x,y,dw,dh);
}
@rect.scale(rc, rate, ty ) {
	rc.inject(x,y,w,h);
	dw=w*rate, dh=h*rate;
	dx=w-dw, dy=h-dh;
	switch(ty) {
	case left:
		dy/=2;
		x+=dx;
		y+=dy;
	case top:
		dx/=2, dy/=2;
		x+=dx;
		y+=dy;
	case right:
		dy/=2;
		y+=dy;
	case bottom:
		dx/=2;
		x+=dx;
	case lt:
		x+=dx;
		y+=dy;
	case lb:
		x+=dx;
	case rt:
		y+=dy;
	} 
	return rc(x,y,dw,dh);
}

@rect.arr(rc, &info, a, hbox) {
	not(a) a=_arr();
	type=when(hbox,'hbox','vbox');
	vbox=type.eq('vbox');
	rc.inject(x,y,w,h);
	arr=_arr()
	if(typeof(info,'num')) {
		num=info.toInt();
		if(vbox) arr.div(num, h, y) else  arr.div(num, w, x);
	} else {
		if(vbox) arr.div(info, h, y) else  arr.div(info, w, x);
	}
	last=arr.size()-1;
	if( last<1 ) return a;
	while(n=0, n<last, n++ ) {
		if( vbox ) {
			y=arr.get(n);
			h=arr.dist(n,1);
		} else {
			x=arr.get(n);
			w=arr.dist(n,1);
		}
		a.add(rc(x,y,w,h) );
	}
	return a;
}
@rect.merge(a, b) {
	rc1=when(typeof(a,'rect'), a, rc(a));
	rc2=when(typeof(b,'rect'), b, rc(b));
	not(typeof(rc1,"rect") || typeof(rc2,"rect") )  return null;
	rc1.inject(x,y,w,h);
	rc2.inject(x1,y1,w1,h1);
	r=x+w, r1=x1+w1, b=y+h, b1=y1+h1;
	xx=min(x,x1), yy=min(y,y1), rr=max(r,r1), bb=max(b,b1);
	ww=rr-xx;
	hh=bb-yy;	
	return rc(xx,yy,ww,hh);
}

@rect.margin(rc, &margin) {
	if(typeof(margin,"num") ) {
		return rc.incr(margin);
	}
	not(typeof(rc,"rect")) return;
	rc.inject(x,y,w,h);
	arr=margin.split();
	switch(arr.size()) {
	case 2: 
		arr.inject(dx, dy);
		x+=dx, y+=dy;
		w-=$[2*dx], h-=$[2*dy];
	case 4:
		arr.inject(dx,dy,dw,dh);
		x+=dx, y+=dy, w-=dw, h-=dh;
		if(dx) w-=dx;
		if(dy) h-=dy;
	}
	return rc(x,y,w,h);		
}
</func>

<func note="공통 화면구현">  
@ui.common(dc) { dc[
	setRectCanvas(rcParent, type) {
		switch(type) {
		case center:
			this.var(rect).size().inject(w,h);
			rect=rc(rcParent.center(),w,h);
		default:
			rect=rcParent;
		}
		this.offsetPos=rect.lt();
		this.rcCanvas=rect;
	}
	getRect(key, idx) {
		not(key) return this.var(rect);
		if(key.eq("canvas")) {
			rc=this.rcCanvas;
		} else if(typeof(idx,"num")) {
			args(2,&info);
			arr=this.get("@$key");
			rc=when(arr,arr.get(idx));
		} else {
			args(1,&info);
			name=key.upper(1);
			rc=this.get("rc$name");
		}
		if(info) {
			if(typeof(info,"bool")) {
				return rc.offset(this.offsetPos,info);
			}
			type=info.move();
			print("get rect info => $type $info");
		}
		return rc;
	}
	box(&info, hbox) {
		arr=this.addArray("@box");
		if(info) {
			return @rect.arr(this.getRect(), info, arr.reuse(), hbox);
		}
		return arr;
	}
	rectArray(key, rc, &info, hbox) {
		arr=this.addArray("@$key"); 
		not(typeof(rc,"rect")) return arr;
		return @rect.arr(rc, info, arr.reuse(), hbox);
	}
	tickTime(key, bset) {
		tm=this.get("@$key");
		if(typeof(bset,"bool")) {
			if(bset) this.set("@$key", System.tick());
			else this.set("@$key", 0);
		}	
		if(tm) {
			return System.tick()-tm;
		}
		return 0;
	}
	movePos(prevPos, currentPos) {
		prevPos.inject(dx, dy);
		currentPos.inject(px,py);
		this.offsetPos.inject(ox, oy);
		px-=dx;
		py-=dy;
		ox+=px;
		oy+=py;
		return pt(ox,oy);
	}
	ui(name, rc, type) {
		list=this.addArray("@uiList") not(name) return list;
		obj=null;
		if(typeof(name,"node")) {
			obj=name;
			not(obj.name) return print("ui 추가오류 객체명이 없습니다");
			not(list.find(obj)) list.add(obj);
		} else {
			while(cur, list) {
				if(cur.cmp("name",name)) {
					obj=cur;
					break;
				}
			}
		}
		if(typeof(rc,"rect")) obj.setRectCanvas(rc,type);
		return obj;
	}
	drawUi(dc, &s) {
		while(s.valid()) {
			name=s.findPos(",").trim();
			ui=this.ui(name);
			not(ui) continue;
			dc.image(ui.rcCanvas, ui);
		}
	}
	load(name, bsize) {
		img=Cf.imageLoad(name)
		not(img) {
			img=mdc("noimage");
			not(img) {
				img=mdc("noimage", 80, 60);
				img.text("no image", "center");
			}
		}
		if(bsize) return img.imageSize();
		return img;
	}
	getMap(key, &str) {
		map=this.addNode("@$key");
		if(typeof(str,"bool")) {
			return map.ref(data);
		}
		not(str) return map;
		row=0, maxColumn=0;
		map[data]=str;
		while( str.valid() ) {
			line=str.findPos("\n");
			not(line.ch()) continue;
			while( line.valid(), c ) {
				map[$row $c]=line.findPos(",");
			}
			if(c.gt(maxColumn)) maxColumn=c;
			row++;
		}
		map[rowCount]=row;
		map[maxColumn]=maxColumn;
		return map;
	}
	getPosArray(key, &str) {
		arr=this.addArray("@$key",true);
		if(typeof(str,"bool")) {
			return map.ref(data);
		}
		not(str) return map;
		row=0, maxColumn=0;
		map[data]=str;
		while( str.valid() ) {
			line=str.findPos("\n");
			not(line.ch()) continue;
			while( line.valid(), c ) {
				map[$row $c]=line.findPos(",");
			}
			if(c.gt(maxColumn)) maxColumn=c;
			row++;
		}
		map[rowCount]=row;
		map[maxColumn]=maxColumn;
		return map;
	}
	getLocalPos(pos) {
		pt=pos.offset(this.offsetPos,false);
		return when(this.getRect().contains(pt), pt);
	}
] return dc}

@ui.popup(dc, canvas) { dc[
	onInit() {
		funcNode.inject(canvas);
		@ui.common(this);
	} 
	update(rect) {
		while(rc, this.box("90,*,40"), idx) {
			row=this.rectArray("row$idx", rc, "30,*,30", true); 
			switch(idx) {
			case 0: this[rcTitle]=row[1];
			case 1: this[rcBody]=row[1];
			case 2: this[rcStatus]=row[1];
			}
		}
		this[rcClose]=this.getRect("box",0).rightCenter(24,24,-24,0);
		return dc[rcBody];
	}
	draw(dc) { 
		not(dc) dc=this;
		num=this.box().size();
		while(num, idx ) {
			row=this.rectArray("row$idx");
			switch(idx) {
			case 0:
				dc.image(row[0], "popup_top_left.png");
				dc.image(row[1], "popup_top_center.png");
				dc.image(row[2], "popup_top_right.png");			
			case 1:
				dc.image(row[0], "popup_body_left.png");
				dc.image(row[1], "popup_body_center.png");								
				dc.image(row[2], "popup_body_right.png");
			case 2:
				dc.image(row[0], "popup_status_left.png"); 
				dc.image(row[1], "popup_status_center.png");  
				dc.image(row[2], "popup_status_right.png");
			default:
			}
		}
		this.inject(rcClose, rcBody);
		this.drawContent(dc, rcBody);
		dc.image(rcClose, "close_n.png");
	}
	drawContent(dc, rc) {
		print("draw content", rc);
	}
	drawOverlay(dc) {
		this.inject(rcClose, rcBody, rcHover);
		if(rcClose.eq(rcHover)) {
			dc.image(rcClose.offset(offsetPos), "close_p.png");
		}
	}
	mouseMove(pos) {
		downPos=this.var(mouseDownPos);
		if(downPos) {
			this.offsetPos=this.movePos(downPos, pos);
			this.var(mouseDownPos, pos);
			canvas.redraw();
		}
	}
	mouseDown(pos) {
		this.inject(rcClose);
		if(rcClose.contains(pt)) {
			this[rcHover]=rcClose;
			canvas.redraw();
			return;
		}
		this.var(mouseDownPos, pos);
	}
	mouseUp(pt) {
		this.var(mouseDownPos, null);
	}
] return dc}
 
</func>
 
<func note="키보드 위젯"> 
	@ui.keyboard(id) {
		not(id) id='keyboard';
		Cf.sourceApply(#[
	<widgets base="ui">
	<context id="${id}">
		onInit(){
			automata=Cf.automata();
			keyboardImage=Cf.imageLoad("app/keyborad_bg.png");
			keyMaps=this.addNode("keyMaps")
			this.transBackground('noBackground');
			this.size(885, 290);
			this.timer("focus",800);
			this.var(bgMode, true);
			this.makeKeyMap('engLower', conf('keyboard.engLower'));
			this.makeKeyMap('engUpper', conf('keyboard.engUpper'));
			this.makeKeyMap('korLower', conf('keyboard.korLower'));
			this.makeKeyMap('korUpper', conf('keyboard.korUpper'));
			this.makeKeyMap('etc');
			this.langMode='eng';
			this.keyMode=''
			this.ingString=''
			this.leftString=''
			this.doneString=''
			this.doingString=''
			this.inputValue=''
			clear();
		}
		onTimer() {
			input=this.var(focusWidget);
			not(input) return;
			input.active();
			input.focus();
			this.var(focusWidget, null);
		}
		onDraw(dc, rc) {
			dc.image(keyboardImage);
			@ui.keyboardUpdate(rc)
			@ui.keyboardDraw(dc, rc)
		}
		onMouseDown(pos) {
			@ui.keyboardMouseDown(pos);
		}
		onMouseUp(pos) {
			key=this.var(mouseDownKey);
			not(key) return;
			this.var(mouseDownKey, null);
			if(this[$key].contains(pos) ) {
				@ui.keyboardKeyInput(pos, key);
				this.updateWidget();
			}
		}
		clear(focus) {
			automata.clear();
			this.ingString=''
			this.inputValue=''
			this.doneString=''
			this.doingString=''
			if(focus) {
				input=this.var(inputTarget);
				if(input) {
					this.var(focusWidget, input);
				}
			} else {
				this.var(inputWidget, null)
			}
		}
		makeKeyMap(langMode, &s) {
			map=keyMaps.addNode(langMode);
			row=0;
			while( s.valid() ) {
				line=s.findPos("\n");
				not(line.ch()) continue;
				while( line.valid(), col ) {
					map[key $row $col]=line.findPos(",").trim();
				}
				row++;
			}
		}
		setInputWidget(input, force) {
			not(force) {
				if(input==this.var(inputWidget)) return;
			}
			this.clear()
			this.inputValue=input.value()
			this.var(inputWidget, input)
			this.var(focusWidget, input)
		}
		setInputValue() {
			input=this.var(inputWidget)
			not(input) return;
			input.value(this.inputValue)
			this.var(focusWidget, input)
		}
	</context>
	</widgets>])
		return object("context.ui:${id}");
	}
	@ui.keyboardSetValue(val ) {
		switch( val ) {
		case enter: val="\n";
		case tab: val="\t";
		case dot: val='.';
		case comma:	val=',';
		}
		mode=this.langMode;
		str='';
		// addMode=when( this.leftString, 'leftString','doneString');
		if( mode.eq('kor') && val.is("alpha") ) {
			not(this.doneString, this.doingString ) {
				this.leftString=this.inputValue;
			}
			this.ingString.add(val);
			automata.toString(this, 'doneString');
			print("xxxxxxx", this[doneString], this[doingString], this[ingString])
			if(this.doneString) {
				str.add(this.doneString );
			}
			if(this.doingString) {
				str.add(this.doingString);
			}
			this.inputValue=this.leftString
			if(str) this.inputValue.add(str);
		} else {
			if(this.doneString) {
				str.add(this.doneString );
				this.doneString=''
			}
			if(this.doingString) {
				str.add(this.doingString );
				this.doingString=''
			}
			if(this.ingString) {
				this.ingString=''
			}
			str.add(val);
			this.inputValue.add(str);
		} 
		
		if( mode.eq("shift", "ctrl") ) {
			this.keyMode=''
		}
	}
	@ui.keyboardKeyInput(pos, &key) {
		key.move();
		row=key.move(), col=key.move();
		mode=this.keyMode;
		kind=this.langMode;
		not(kind.eq('etc')) {
			kind='eng'
			if( mode.eq("shift","shiftOn") ) {
				kind.add("Upper");
			} else {
				kind.add("Lower");
			}
		}
		keyMap=keyMaps.get(kind);		
		print(">> key input", pos, keyMap[key $row $col], row, col, mode, kind)
		switch(row) {
		case 0:
			if( col.eq(10) ) {
				if( this.ingString ) {
					str=''
					ing=this.ingString;
					if( ing.size().eq(1) ) {
						this.ingString=''
					} else {
						this.ingString=ing.value(0,-1);
						automata.toString(this, 'doneString');
						if(this.doingString) {
							str.add(this.doingString);
						}
					}
					this.inputValue=this.leftString
					if(str) this.inputValue.add(str)
				} else {
					str=this.inputValue.substr(0,-1);
					this.inputValue=str
					this.doneString=''
					this.doingString=''
					this.ingString=''
				}
			} else {
				@ui.keyboardSetValue( keyMap[key $row $col] );
			}
		case 1:
			if( col.eq(10) ) {
				@ui.keyboardSetValue("\n");
			} else {
				@ui.keyboardSetValue( keyMap[key $row $col] );
			}
		case 2:
			if( col.eq(0,11) ) {
				if( mode.eq("shift","shiftOn") ) {
					this.keyMode = when(mode.eq("shift"),"shiftOn")
				} else {
					this.keyMode = "shift"
				}
			} else {
				@ui.keyboardSetValue( keyMap[key $row $col] );
			}
		case 3:
			if( col.eq(9,10) ) {
				input=this.var(inputWidget);
				if(input) {
					pos=input.pos();
					if(c.eq(9) ) {
						if(pos>0) pos--;
					} else {
						len=input.value().length();
						if(pos<len) pos++;
					}
					input.pos(pos);
					this.var(focusWidget, input);
				}
			} else if( col.eq(0)) {
				if( this.langMode.eq('etc') ) {
					this.langMode=this.prevMode;
				} else {
					this.prevMode=this.langMode;
					this.langMode='etc';
				}
			} else if( col.eq(1)) {
				if(mode.eq("ctrl") ) {
					this.keyMode='';
				} else {
					this.keyMode='ctrl';
				}
			} else if( col.eq(3)) {
				@ui.keyboardSetValue( "\t" );
			} else if( col.eq(4)) {
				@ui.keyboardSetValue( " " );
			} else if( col.eq(8)) {
				if( this.langMode.eq('kor') ) {
					this.langMode='eng';
				} else {
					this.langMode='kor';
				}
			} else if( col.eq(11)) {
				@ui.keyboardEscape();
			} else {
				@ui.keyboardSetValue( keyMap[key $row $col] );
			}
		default:
		}
		this.setInputValue();
	}
	@ui.keyboardEscape() {
		print("escape key down")
		this.clear();
	}
	@ui.keyboardMouseDown(pos) {
		not( typeof(this.var(rect),"rect")) return;
		while( n=0, n<4, n++ ) {			
			switch(n) {
			case 0:
				while( c=0, c<11, c++ ) {
					rc=this[rc $n $c];
					not( rc.contains(pos) ) continue;
					return _update();
				}
			case 1:
				while( c=0, c<11, c++ ) {
					rc=this[rc $n $c];
					not( rc.contains(pos) ) continue;
					return _update();
				}
			case 2:
				while( c=0, c<12, c++ ) {
					rc=this[rc $n $c];
					not( rc.contains(pos) ) continue;
					return _update();
				}
			case 3:
				while( c=0, c<12, c++ ) {
					if( c.eq(4,5,6,7) ) {
						not( c.eq(4) ) continue;
						rc=this[rcSpace];
					} else {
						rc=this[rc $n $c];
					}
					not( rc.contains(pos) ) continue;
					return _update();
				}
			default:
			}
		}
		return;
		_update=func() { 
			this.var(mouseDownKey, "rc $n $c"); 
			this.updateWidget();
			return true;
		};
	}
	@ui.keyboardUpdate(rc) {
		if(rc.eq(this.var(rect)) ) return;
		this.var(rect,rc)
		ox=8, oy=8, bw=67, bh=60, gabX=6, gabY=7;
		rc.inject(sx, sy);
		sy+=oy;
		while( n=0, n<4, n++ ) {
			switch(n) {
			case 0:
				cx=sx+ox;
				while( c=0, c<10, c++ ) {
					this[rc $n $c]=rc(cx,sy,bw,bh) cx+=bw+gabX;
				}
				w=876-cx;
				if( w<60 ) w=110;
				this[rc $n $c]=rc(cx,sy,w,bh);
				sy+=bh+gabY;
			case 1:
				cx=sx+24;
				while( c=0, c<10, c++ ) {
					this[rc $n $c]=rc(cx,sy,bw,bh) cx+=bw+gabX;
				}
				w=876-cx;
				if( w<60 ) w=110;
				this[rc $n $c]=rc(cx,sy,w,bh);
				sy+=bh+gabY;
			default:
				cx=sx+ox;
				while( c=0, c<12, c++ ) {
					this[rc $n $c]=rc(cx,sy,bw,bh) cx+=bw+gabX;
				}
				sy+=bh+gabY;
				if( n.eq(3) ) {
					r1=this[rc $n 4], r2=this[rc $n 7];
					this[rcSpace]=mergeRect(r1,r2);
				}
			}
		}
	}
	@ui.keyboardDraw(dc, rc) {
		this.inject(langMode, keyMode);
		kid=langMode;
		not(kid.eq("etc") ) {
			if( keyMode.eq("shift","shiftOn") ) {
				kid.add("Upper");
			} else {
				kid.add("Lower");
			}
		}
		key=this.var(mouseDownKey);
		downRect=when(key, this[$key]);
		keyMap=keyMaps.get(kid);
		dc.fill('#1a1a1a'); 
		dc.font("size:16px, color:#eee");
		while( n=0, n<4, n++ ) {
			switch(n) {
			case 0:
				while( c=0, c<11, c++ ) {
					rc=this[rc $n $c];
					if( rc.eq(downRect) ) {
						rc.incr(-4);
						dc.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
					} else {
						dc.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
					}
					keyText();
				}
			case 1:
				while( c=0, c<11, c++ ) {
					rc=this[rc $n $c];
					if( rc.eq(downRect) ) {
						rc.incr(-2);
						dc.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
					} else {
						dc.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
					}
					keyText();
				}
			case 2:
				while( c=0, c<12, c++ ) {
					rc=this[rc $n $c];
					if( c.eq(0,11) ) {
						if( rc.eq(downRect) ) {
							dc.fill(rc,'#7a7070').rectLine(rc, 0, '#20202a');
						} else if( keyMode.eq("shiftOn") ) {
							dc.fill(rc,'#c06a7b').rectLine(rc, 0, '#d09ab0', 2);
						} else if( keyMode.eq("shift") ) {
							dc.fill(rc,'#9a9090').rectLine(rc, 0, '#20202a');
						} else {
								dc.fill(rc,'#4d4d4d').rectLine(rc, 0, '#20202a');
						}
						keyText();
					} else {
						if( rc.eq(downRect) ) {
							rc.incr(-4);
							dc.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
						} else {
							dc.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
						}
						keyText();
					}
				}
			case 3:
				while( c=0, c<12, c++ ) {
					if( c.eq(4,5,6,7) ) {
						not( c.eq(4) ) continue;
						rc=this[rcSpace];
						if( rc.eq(downRect) ) {
							rc.incr(-2);
							dc.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
						} else {
							dc.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
						}
					} else {
						rc=this[rc $n $c], def=true;
						if( c.eq(1) ) {
							 if( keyMode.eq("ctrl") ) {
								dc.fill(rc,'#9a9090').rectLine(rc, 0, '#20202a');
							} else {
								dc.fill(rc,'#4d4d4d').rectLine(rc, 0, '#20202a');
							}
							def=false;
						} else if( c.eq(8) ) {
							if( this.langMode.eq('kor') ) {
								dc.fill(rc,'#707a7a').rectLine(rc, 0, '#40404a');
								def=false;
							}
						}
						if( def ) {
							if( rc.eq(downRect) ) {
								dc.fill(rc,'#7a7070').rectLine(rc, 0, '#20202a');
							} else {
								dc.fill(rc,'#4d4d4d').rectLine(rc, 0, '#20202a');
							}
						}
						keyText();
					}
				}
			default:
			}
		}
		keyText=func() {
			key=keyMap[key $n $c];
			switch(key) {
			case comma:
				dc.text(rc,',' ,'center');
			case dot:
				dc.text(rc, '.','center');
			case bs:
				img=Cf.imageLoad('app/icon_bs.png');
				dc.image( rc, img, "center");
			case enter:
				img=Cf.imageLoad('app/icon_enter.png');
				dc.image( rc, img, "center");
			case etc:
				img=Cf.imageLoad('app/icon_etc.png');
				dc.image( rc, img, "center");
			default:
				dc.text(rc, key, 'center');
			}
		};
	}
	
	
</func>
