<func>
@pages.widgetName(&s, prop) {
	if(prop.isset('name')) {
		name=prop.get('name')
		if(name) return name;
	}
	a=s.findLast('-')
	if(a) name=a.right().trim() else name=s.trim()
	return name;
}
@pages.src(&s, node, fnRoot) {
	not(node) node=_node()
	not(fnRoot) fnRoot=Cf.funcNode('parent')
	ss=''
	while(s.valid()) {
		left=s.findPos("<#");
		ss.add(@pages.srcParse(left,node,fnRoot))
		not(s.ch()) break;
		sp=s.cur()
		c=s.next().ch()
		while(c.eq('-','#')) c=s.next().ch()
		tag=s.trim(sp,s.cur(),true)
		src=conf("src#widget.${tag}")
		if(src) {
			props=@pages.srcProps(null,fnRoot)
			name=@pages.widgetName(tag, props)
			print("xxx >>",props, name)
			ss.add(@pages.parseWidget(src, name, props, fnRoot))
			if(props.init) fnRoot.append('script', props.init, "\r\n")
			if(props.vars) fnRoot.append('vars', props.vars, "\r\n")
			if(props.css) fnRoot.append('css', props.css, "\r\n")
		} else {
			ss.add("=> $widgetName 소스 미정의")
		}
	}
	return ss
}

@pages.parseWidget(&s, name, props, fnRoot) {
	not(s.find('@@')) return @pages.srcParse(s,props,fnRoot);
	ss=''
	while(s.valid()) {
		left=s.findPos('@@')
		ss.add(left)
		not(s.ch()) break
		ss.add("store.$name")
	}
	return @pages.srcParse(ss,props,fnRoot);
}

@pages.srcLocalStr(&s,node,fnRoot) {
	pfn=Cf.funcNode('parent')
	ss=''
	while(s.valid()) {
		left=s.findPos('$')
		ss.add(left)
		not(s.ch()) break
		code=s.move()
		val=@pages.srcLocalVarVal(code,node,fnRoot)
		if(val) ss.add(val) else ss.add('$',code)
		if(s.ch('^')) s.incr()
	}
	return ss
}

@pages.srcLocalVarVal(code,node,fnRoot) {
	if(node.isset(code) ) return node.get(code)
	if(fnRoot.isset(code) ) return fnRoot.get(code)
	return;
}
@pages.srcProps(props,fnRoot) {
	not(props) props=_node()
	while(s.valid()) {
		sp=s.cur()
		c=s.next().ch()
		while(c.eq('-')) c=s.next().ch()
		code=s.trim(sp, s.cur(), true)
		if(c.eq('(')) {
			fparam=s.match().trim()
			ch=s.ch()
			if(ch.eq('{')) {
				fsrc=s.match(1)
			} 
			else if(s.start('=>',true)) {
				if(s.ch('{')) {
					fsrc=s.match(1)
				} else {
					if(lineCheck(s,';')) fsrc=s.findPos(';')
					else fsrc=s.findPos("\n")
				}
			}
			if(fsrc.find("\n")) src="{$fsrc}" else src=fsrc;
			if(fparam.find(','))
				val="($fparam)=>$src"
			else 
				val="$fparam=>$src"
			props.set(code,val)
		} else if(c.eq('=',':')) {
			c=s.incr().ch()
			if(c.eq()) {
				val=s.match()
				props.set(code,val)
			} else if(c.eq('{','[','(')) {
				if(c.eq('{')) {					
					val=s.match(1)	
				} else if(c.eq('{')) {
					val=@pages.src(s.match(),props,fnRoot)
				} else {
					fparam=s.match().trim()
					ch=s.ch()
					if(ch.eq('{')) {
						fsrc=s.match(1)
					} 
					else if(s.start('=>',true)) {
						if(s.ch('{')) {
							fsrc=s.match(1)
						} else {
							if(lineCheck(s,';')) fsrc=s.findPos(';')
							else fsrc=s.findPos("\n")
						}
					}
					if(fsrc.find("\n")) src="{$fsrc}" else src=fsrc;
					if(fparam.find(','))
						val="($fparam)=>$src"
					else 
						val="$fparam=>$src"
				}
				props.set(code,val)
			} else {
				val=s.findPos("> \t\n",4).trim()
				props.set(code,val)
			}
		} else {
			props.set(code,true)
		}
		c=s.ch()
		if(c.eq('/','>')) {
			if(c.eq('/')) {
				s.findPos('>')
			} else {
				s.incr()
			}
			break;
		}
	}
	return props;
}

@pages.srcParse(&s,node, fnRoot) {
	if(s.find('<#')) return @pages.src(s,node,fnRoot)
	rst='';
	while(s.valid()) {
		left=s.findPos('#{',0,1);
		rst.add(left);
		not(s.ch()) break;
		ss=s.incr().match(1);
		if(typeof(ss,'bool')) {
			line=s.findPos("\n")
			print("parse content not match line==$line")
			continue;
		}
		if(keyCheck(ss)) {
			ok=false;
			while(ss.valid()) {
				val='';
				if(ss.find('?',1)) {
					cmp=ss.findPos('?',1);
					ok=@pages.srcCheck(cmp,node,fnRoot);
					val=keyVal();
				} else {
					not(ok) ok=true;
					val=keyVal();
				}
				if(ok) {
					rst.add(val);
					break;
				}
				if(ss.ch(':')) {
					ss.incr();
				} else {
					if(ss.ch()) print("parse content check break line==$ss");
					break;
				}
			}
		} else if(keyFunc(ss)) {
			fnm=ss.move()
			fparam=ss.match()
			if(fnm.eq('props')) {
				while(fparam.valid()) {
					name=fparam.findPos(',').trim()
					if(node.isset(name)) {
						v=node.get(name)
						if(typeof(v,'num')) {
							val=v
						} else if(v.eq('true','false','null')) {
							val=v.typeValue()
						} else {
							val=Cf.jsValue(v)
						}
						rst.add(name,':',val,',')
					}
				}
			}
		} else {
			@pages.srcVar(ss,'val',node,fnRoot);
			if(val) rst.add(val);
		}
	}
	return rst;
	keyCheck=func(&s) {
		line=s.findPos("\n");
		if(line.find('?')) return true;
		return false;
	};
	keyFunc=func(&s) {
		c=s.next().ch()
		if(c.eq('(')) return true;
		return false;
	}
	keyVal=func() {
		c=ss.ch(), val='';
		if(c.eq()) {
			val=ss.match();
		} else if(c.eq('{')) {
			c=ss.ch(1)
			if(c.eq('[')) {
				val=@pages.src(ss.match('{[',']}'))
			} else {
				val=ss.match(1)
			}
		} else if(c.eq('[')) {
			val=@pages.srcLocalStr(ss.match(1), node, fnRoot)
		} else {
			val=ss.findPos(':',1,1)
		}
		not(ok) return;
		return val;
	};
}
@pages.srcCheck(&s,node,fnRoot) {
	if(isFunc(s)) {
		fnm=s.move().lower();
		param=s.match();
		if(fnm.eq('not')) {
			@pages.srcVar(param,'val',node,fnRoot);
			return when(val,false,true);
		} 
		if(fnm.eq('typeof')) {
			a=param.findPos(',').trim();
			b=param.findPos(',').trim();
			if(node.isset(a)) {
				val=node.get(a);
				not(val) return false;
				if(b.eq('string')) return true
				if(b.eq('num')) return typeof(val,'num')
			} else {
				if(b.eq('null')) return true
			}
			return false;
		}  
		return false;
	}
	oper=0;
	ok=false,a='',b='';
	s.pos(@pages.srcVar(s,'a',node,fnRoot));
	c=s.ch();
	if(c.eq(',')) {
		/* (ex)  @{ a,b,c ? ok } */
		while(c.eq(',')) {
			name=s.incr().move();
			if(node && node.isset(name) ) {
				val=node.get(name)
			}
			not(val) return false;
		}
	}
	not(ch) return when(a,true,false);
	if(c.eq('=','!','<','>')) {
		c1=s.incr().ch();
		if(c1.eq('=')) {
			c=s.incr().ch();
			if(c.eq('=')) oper=1;
			else if(c.eq('!')) oper=2;
			else if(c.eq('<')) oper=5;
			else if(c.eq('>')) oper=6;
		} else {
			c=c1;
			if(c.eq('=')) oper=1;
			else if(c.eq('<')) oper=3;
			else if(c.eq('>')) oper=4;
		}
	} 
	if(oper) {
		s.pos(@pages.srcVar(s,'b',node,fnRoot));
		switch(oper) {
		case 1: ok=a.eq(b);
		case 2: ok=a.ne(b);
		case 3: ok=a.lt(b);
		case 4: ok=a.gt(b);
		case 5: ok=a.le(b);
		case 6: ok=a.ge(b);
		}
	} else {
		ok=when(a,true,false);
	}
	return ok;
}

@pages.srcVar(&s,varName,node,fnRoot) {  
	pfn=Cf.funcNode('parent');
	ch=s.ch()
	sp=s.cur()
	pfn.set(varName, ''); 
	if(sp>=ep) ep=sp+1;
	not(ch) return ep;
	val=''
	if(ch.eq()) {
		val=s.match()
	} else if(ch.eq('[')) {
		val=@pages.srcLocalStr(s.match(),node,fnRoot)
	} else {
		name=s.move();
		if(typeof(name,'num')) {
			val=name
		} else if(name.eq('null','true','false')) {
			val=name.typeValue()
		} else if(node.isset(name) ) {
			val=node.get(name)
			not(val) val=fnRoot.get(name)
		} else {
			val=fnRoot.get(name)
		}
		not(val) {
			if(s.start('::',true)) {
				val=s.trim();
				s.pos(ep);
			}
		}
	}
	pfn.set(varName, val);
	return s.cur();
}
</func>