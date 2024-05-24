<func>
@was.applyPageSrc(&s, node) {
	not(node) node=_node() 
	node.data=null
	not(s.ch()) return print("apply page src is empty")
	type=s.move().lower(), act='';
	line='', param='';
	c=s.ch()
	if(c.eq('-')) act=s.incr().move()
	if(type.eq('post')) {
		if(lineCheck(s,'{')) {
			line=s.findPos('{',0,1)
			param=s.match()
		} else {
			line=s.findPos("\n")
		}
	} else {
		line=s.findPos("\n").trim()
	}
	not(type) {
		node.error="apply command not defined"
		return
	}
	not(act) act='read'
	print(">>", type, act, s.size() )
	switch(type) { 
	case leftmenu:
		if(act.eq('save')) {
			conf("global#web.leftMenu", s, true)
			node.message="$service::$name 메뉴적용";
		} else {
			src=conf("global#web.leftMenu")
			if(src) {
				node.message="ok"
				node.result="leftMenu-save\n$src"
			} else {
				node.message="$service::$name 페이지 소스가 없습니다";
			}
		}
	case page:
		@was.commandPage(node, act, line, s)
	case component:
		@was.commandComponent(node, act, line, s)
	case widget:
		@was.commandWidget(node, act, line, s)
	case func:
		@was.commandFunc(node, act, line, s)
	case url:
		@was.commandUrl(node, act, line, s)
	case conf:
		@was.commandConf(node, act, line, s)
	default:
		node.message="$type 은 정의되지 않은 타입입니다"
	}
	ss=Cf.jsValue(node.get('result')) 
	return node
}
@was.commandPage(node, action, &line, &data) {
	if(line.find('/')) {
		line.start('/api/', true)
		service=line.findPos('/').trim()
	} else {
		service='pages'
	}
	name=line.trim()
	switch(action) {
	case read:
		src=conf("src#${service}.${name}")
		if(src) {
			node.message="ok"
			node.result="page-save /api/$service/$name\n$src"
		} else {
			node.message="$service::$name 페이지 소스가 없습니다";
		}
	case save:
		conf("src#${service}.${name}", data, true)
		node.message="$service::$name 페이지 적용";
	case delete:
		filter=" grp='src#${service}' and cd like '${name}'"
		db=Baro.db('config')
		db.exec("delete from conf_info where $filter")
		rows=db.var(affectRows)
		if(rows) {
			node.message="$name 페이지를 삭제했습니다";
		} else {
			node.message="$name 페이지 삭제오류";
		}
	case list:
		filter=" grp='src#${service}'"
		b=name;
		if(b) {
			not(b.find('%')) b.add('%')
			filter.add(" and cd like '$b' ");
		}
		db=Baro.db('config')
		db.fetchAll("select grp, cd from conf_info where $filter order by grp, cd", node)
		rst="page-list $name\n"
		while(cur, node, idx) {
			cur.inject(grp, cd)
			rst.add("$grp >> $cd\n");
		}
		node.result=rst;
	default:
	}
}
@was.commandWidget(node, action, &line, &data) {
	ln="\n"
	name=line.trim()
	switch(action) {
	case read:
		src=conf("src#widget.$name")
		if(src) {			
			node.message="ok"
			node.result="widget-save $name\n$src"
		} else {
			node.message="콤포너트 $name 소스가 없습니다";
		}
	case save:
		if(name) {
			conf("src#widget.$name", data, true)
		} else {
			node.message="콤포너트 이름 미정의";
		}
	case list:
		filter=" grp='src#widget'"
		b=name;
		if(b) {
			not(b.find('%')) b.add('%')
			filter.add(" and cd like '$b' ");
		}
		db=Baro.db('config')
		db.fetchAll("select grp, cd from conf_info where $filter order by grp, cd", node)
		rst="widget-list $name\n"
		while(cur, node, idx) {
			cur.inject(grp, cd)
			rst.add("$grp >> $cd\n");
		}
		node.result=rst;
	default:	
	}
	return node;
}
@was.commandComponent(node, action, &line, &data) {
	ln="\n"
	name=line.trim()
	switch(action) {
	case read:
		src=conf("src#component.$name")
		if(src) {
			val=_read(src)
			node.message="ok"
			node.result="component-save $name\n$val"
		} else {
			node.message="콤포너트 $name 소스가 없습니다";
		}
	case save:
		if(name) {
			conf("src#component.$name", _src(data), true)
		} else {
			node.message="콤포너트 이름 미정의";
		}
	case list:
		filter=" grp like 'src#component'"
		b=name;
		if(b) {
			not(b.find('%')) b.add('%')
			filter.add(" and cd like '$b' ");
		}
		db=Baro.db('config')
		db.fetchAll("select grp, cd from conf_info where $filter order by grp, cd", node)
		rst="component-list $name\n"
		while(cur, node, idx) {
			cur.inject(grp, cd)
			rst.add("$grp >> $cd\n");
		}
		node.result=rst;
	default:	
	}
	return node;
	
	_src=func(&s) {
		rst=''
		while(s.valid()) {
			left=s.findPos('<script',0,1)
			rst.add(left)
			not(s.ch()) break;
			ss=s.match('<script','</script>')
			if(typeof(ss,'bool')) break;
			ss.findPos('>');
			rst.add('<js>',ss,'</js>')
		}
		return rst;
	};
	_read=func(&s) {
		rst=''
		while(s.valid()) {
			left=s.findPos('<js',0,1)
			rst.add(left)
			not(s.ch()) break;
			ss=s.match('<js>','</js>')
			if(typeof(ss,'bool')) break;
			rst.add(ln,'<script>',ss,'</script>')
		}
		return rst;
	};
}
@was.commandUrl(node, action, &line, &data) {
	ln="\n"	
	url=line.findPos(' ').trim()
	not(url) {
		url="main"
	}
	if(url.eq('index','main')) {
		name=url
		url='/'
	} else {
		if(line.valid()) {
			name=line.trim()
		} else {
			ss=url.findLast('/')
			name=ss.right()
		}
	}
	not(url) {		
		return node.set("error","URL 매핑 정보가 없습니다") 
	}
	print("url ==> ", url, name)
	switch(action) {
	case read:
		src=conf("urlMap#${name}.${url}")
		if(src) {			
			node.message="ok"
			if(name.eq('index','main')) {
				node.result="url-save $name\n$src"
			} else {
				node.result="url-save $url $name\n$src"
			}
		} else {
			node.message="URL맵 $name 소스가 없습니다";
		}
	case save:
		ss=data
		if(ss.ch()) {
			conf("urlMap#${name}.${url}", data, true)
			@pages.addWebpageSource(url,name,data)
		} else {
			node.message="URL맵 페이지 소스 미정의";
		}
	case list:
		filter=" grp like 'urlMap#%'"
		db=Baro.db('config')
		db.fetchAll("select grp, cd from conf_info where $filter order by grp, cd", node)
		rst="url-list $name\n"
		while(cur, node, idx) {
			cur.inject(grp, cd)
			rst.add("$grp >> $cd\n");
		}
		node.result=rst;
	case delete:
		filter=" grp like 'urlMap#$name' and cd='$url'"
		db=Baro.db('config')
		db.exec("delete from conf_info where $filter")
		rows=db.var(affectRows)
		if(rows) {
			node.message="$name URL 맵핑정보를 삭제했습니다";
		} else {
			node.message="$name URL 맵핑정보 삭제오류";
		}
	default:
	}
}


@was.commandConf(node, action, &line, &s) {
	name=line.trim()
	not(name) name='src#widget.box' 
	switch(action) {
	case read:
		src=conf(name)
		if(src)
			node.result="conf-save $name\n$src"
		else
			node.message="conf $name 설정정보가 없습니다";
	case save:
		conf(name, s, true)
		node.message="conf $name 설정정보 적용";
	case list: 
		name.split('.').inject(a,b)
		if(a.find('%')) {
			a.add('%')
			filter=" grp like '$a'"
		} else {
			filter="grp='$a'"
		}
		if(b) {
			not(b.find('%')) b.add('%')
			filter.add(" and cd like '$b' ");
		}
		db=Baro.db('config')
		db.fetchAll("select grp, cd from conf_info where $filter order by grp, cd", node)
		rst="conf-list $name\n"
		while(cur, node, idx) {
			cur.inject(grp, cd)
			rst.add("$grp >> $cd\n");
		}
		node.result=rst;
	case delete:
		name.split('.').inject(a,b)
		db=Baro.db('config')
		db.exec("delete from conf_info where grp='$a' and cd='$b' ", node)
		rows=db.var(affectRows)
		if(rows) {
			node.message="$name 설정정보를 삭제했습니다";
		} else {
			node.message="$name 설정정보 삭제오류";
		}
	default:
	}
}

@was.commandFunc(node, action, &line, &s) {
	not(action) action='read'
	rst='', msg='', snm='', fnm='', fparam='';
	if(lineCheck(line,'(')) {
		ss=line.findPos('(',0,1)
		fparam=line.match()
	} else {
		ss=line
	}
	if(ss.ch('@')) ss.incr()
	if(ss.find('.')) {
		ss.split('.').inject(a,b)
		fnm="$a:$b"
		snm="@{a}.${b}"
	} else {
		fnm=ss.trim()
		snm=fnm
	}
	funcs=object("@inc.userFunc")
	switch(action) {
	case list: 	
		kind='all', c=s.ch()
		if(c.eq('-')) kind=s.incr().move()
		rst="func-list-${kind}\n"
		if(kind=='all') { 
			while(k,funcs.keys().sort()) {
				rst.add("\t$k = ",funcs[$k],ln)			
			}
		} else if(kind=='start') {
			ss=line.trim()
			while(k,funcs.keys().sort()) {
				if(k.start(ss)) {
					rst.add("\t$k = ",funcs[$k],ln)
				}
			}
		}
	case read:
		path=System.path()
		pathFunc=funcs[$fnm]
		if(pathFunc ) {
			src=_funcSrc(fileRead("$path/$pathFunc"));
			rst.add("func-save $src")
		}
	case [save,run]:
		rst.add("func-run ${snm}(${fparam})")
		if(lineCheck(line,'{')) {
			rst.add('{', s)
		} else {
			rst.add(s)
		}
		
	default:
	}
	if(msg) node.message=msg
	else if(rst) node.result=rst;
	return node
	
	_funcSrc=func(&s) {
		while(s.valid()) {
			c=s.ch()
			if(s.eq('/')) {
				c=s.ch(1)
				if(c.eq('/')) s.findPos("\n")
				else s.match()
				continue;
			}
			not(lineCheck(s,'(')) return;
			name=s.findPos('(',0,1).trim()
			fparam=s.match()
			fsrc=s.match()
			if(name==snm) {
				return "${snm}(${fparam}) {${fsrc}}"
			}
		}
		return;
	};
}
</func>


<func>
 
@was.parseContent(&s,node) {
	rst='';
	while(s.valid()) {
		left=s.findPos('@{',0,1);
		rst.add(left);
		not(s.ch()) break;
		ss=s.incr().match(1);
		if(ss.find('?')) {
			ok=false;
			while(ss.valid()) {
				val='';
				if(ss.find('?',1)) {
					str=ss.findPos('?',1);
					ok=@was.parseCheck(str,node);
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
					print("content parse check break");
					break;
				}
			}
		} else {
			@was.parseVar(ss,'val',node);
			if(val) rst.add(val);
		}
	}
	return rst;
	keyVal=func() {
		c=ss.ch(), val='';
		if(c.eq()) {
			v=ss.match();
			val=Cf.val(c,val,c)
		} else {
			v=ss.findPos(':',1,1)
			@was.parseVar(v,'val',node)
		}
		not(ok) return;
		return val;
	};
}
@was.parseCheck(&s,node) {
	if(isFunc(s)) {
		fnm=s.move().lower();
		param=s.match();
		if(fnm.eq('not')) {
			@was.parseVar(param,'val',node,true);
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
	s.pos(@was.parseVar(s,'a',node,true));
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
		s.pos(@was.parseVar(s,'b',node,true));
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
@was.parseVar(&s,varName,node,skip) { 
	pfn=Cf.funcNode('parent');
	sp=s.cur()
	ch=s.ch()
	pfn.set(varName, '');
	if(skip) {
		ss=s.find(':');
		ep=ss.size();
	} else {
		ep=s.end()
	}
	if(sp>=ep) ep=sp+1; 
	not(ch) return ep;
	val=''
	if(isFunc(s)) {
		fnm=s.move().lower();
		param=s.match();
		a='', c=param.ch()
		if(c.eq()) { 
			a=param.match().trim() 
		} else {
			a=param.trim()
		}
		switch(fnm) {
		case module:
			val=conf("js#module.$a")
		case component:
			src=conf("src#component.$a")
			val=#[
				global.addComponent('${a}',`${src}`)
			];
		case js:
			val=conf("js#$a")
		case css:
			val=conf("css#$a") 
		case conf:
			val=conf(a)
		case read:
			val=fileRead(a)
		default:
		}
	} else if(ch.eq()) {
		val=s.match()
	} else if(ch.eq('[')) {
		val=s.match()
	} else {
		name=s.move();
		if(typeof(name,'num')) {
			val=name
		} else if(name.eq('null','true','false')) {
			val=name
		} else if(node && node.isset(name) ) {
			val=node.get(name)
			not(val) val=fn.get(name);
			if(val && val.ch('>')) {
				v=val.trim(1);
				val="store.$v";
			}
		}
		not(val, skip) {
			// default 값 설정
			if(s.ch('=')) {
				val=s.incr().trim();
				s.pos(ep);
			}
		}
	}
	pfn.set(varName, val);
	return s.cur();
}
</func>