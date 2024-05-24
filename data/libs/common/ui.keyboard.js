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
			this.makeKeyMap('etc', conf('keyboard.etc'));
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
			@ui.keyboardMouseUp(pos);
		}
		clear(focus) {
			automata.clear();
			this.ingString=''
			this.inputValue=''
			this.doneString=''
			this.doingString=''
			if(focus) {
				input=this.var(inputWidget);
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
		case space:	val=' ';
		case enter: val="\n";
		case tab: 	val="\t";
		case dot: 	val='.';
		case comma:	val=',';
		}
		mode=this.langMode;
		str=''; 
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
		if(key.eq('space') ) {
			@ui.keyboardSetValue('space')
			return this.setInputValue();
		}  
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
				return @ui.keyboardEnter()
			}
			@ui.keyboardSetValue( keyMap[key $row $col] );
		case 2:
			if( col.eq(0,11) ) {
				if(this.langMode=='eng') {
					if( mode.eq("shift","shiftOn") ) {
						this.keyMode = when(mode.eq("shift"),"shiftOn")
					} else {
						this.keyMode = "shift"
					}
				} else {
					if( mode.eq("shift","shiftOn") ) {
						this.keyMode = ""
					} else {
						this.keyMode = "shift"
					}
				}
				return this.redraw()
			} 
			@ui.keyboardSetValue( keyMap[key $row $col] );
		case 3:
			if( col.eq(2)) return @ui.keyboardExtend();
			if( col.eq(3)) return @ui.keyboardTab();
			if( col.eq(11)) return @ui.keyboardEscape();
			if( col.eq(9,10) ) {
				input=this.var(inputWidget);
				if(input) {
					pos=input.pos();
					if(col.eq(9) ) {
						if(pos>0) pos--;
					} else {
						len=input.value().length();
						if(pos<len) pos++;
					}
					input.pos(pos);
					this.var(focusWidget, input);
				}
			} else if( col.eq(0)) {
				if( this.langMode=='etc') ) {
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
			} else if( col.eq(8)) {
				if( this.langMode.eq('kor') ) {
					this.langMode='eng';
				} else {
					this.langMode='kor';
				}
			} else {
				@ui.keyboardSetValue( keyMap[key $row $col] );
			}
		default:
		}
		this.setInputValue();
	}
	@ui.keyboardEscape() {
		print("escape key down")
		input=this.var(inputWidget);
		if(input) {
			input.value('')
			this.clear(true)
		}
	}
	@ui.keyboardExtend() {
		print("keyboard extend key down")
	}
	@ui.keyboardEnter() {
		print("keyboard enter key down")
	}
	@ui.keyboardTab() {
		print("keyboard tab key down")
	}
	@ui.keyboardMouseUp(pos) {
		key=this.var(mouseDownKey);
		not(key) return;
		this.var(mouseDownKey, null);
		if(this[$key].contains(pos) ) {
			@ui.keyboardKeyInput(pos, key);
			this.updateWidget();
		}
	}
	@ui.keyboardMouseDown(pos) {
		not( typeof(this.var(rect),"rect")) return;
		while( n=0, n<4, n++ ) {			
			switch(n) {
			case 0:
				while( c=0, c<11, c++ ) {
					rc=this[rc $n $c];
					if( rc.contains(pos) ) return _update();
				}
			case 1:
				while( c=0, c<11, c++ ) {
					rc=this[rc $n $c];
					if( rc.contains(pos) ) return _update();
				}
			case 2:
				while( c=0, c<12, c++ ) {
					rc=this[rc $n $c];
					if( rc.contains(pos) ) return _update();
				}
			case 3:
				while( c=0, c<12, c++ ) {
					if( c.eq(4,5,6,7) ) {
						not( c.eq(4) ) continue; 
						rc=this[rc space];
						if(rc.contains(pos)) {
							this.var(mouseDownKey, 'rc space')
							this.redraw()
							return true;
						}
					}
					rc=this[rc $n $c];
					if( rc.contains(pos) ) return _update();
				}
			default:
			}
		}
		return;
		_update=func() { 
			this.var(mouseDownKey, "rc $n $c")
			this.redraw()
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
					this[rc space]=mergeRect(r1,r2);
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
						rc=this[rc space];
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