<widgets base="comm">
	<page id="prompt1">
		<form>
			<row>
				<label text="이름" id="name">
				<input id="value">
			</row>
		</form>
		<hbox>
			<space>
			<button id="ok" text="확인" onClick() {
				p=page()
				val=p.get('value').value()
				if(p.callback) p.callback(val)
			}>
			<button id="cancel" text="취소" onClick() {
				page().close()
			}>
		</hbox>
	</page>
</widgets>
<func>
memberFunc(obj, init, grp) {
	map=Cf.getObject('user','subfuncMap')
	if(init) {
		src="onInit() {$init}"
		obj[$src]
	}
	addFunc(map.get(grp))
	addFunc=func(&s) {
		while(s.valid() ) {
			fnm=s.findPos(',').trim()
			not(fnm) break;
			fc=call("${grp}.${fnm}")
			if(typeof(fc,'func')) obj[$fnm]=fc
		}
	}
	return obj
}
classLoad(name ) { 
	path=System.path()
	if(name.ch('/')) {
		ss=name.ref()
		a=ss.findLast('/')
		relative=a.trim();
		name=a.right();
		pathBase=Cf.val(path, relative);
	} else {
		pathBase=Cf.val(path,"/data/libs/classes")
	}
	if(name.find('.')) {
		pathFile="${pathBase}/${name}";
	} else {
		pathFile="${pathBase}/${name}.js";
	}
	print("pathFile == $pathFile")
	not( isFile(pathFile) ) {
		
	}
	src=stripJsComment(fileRead(pathFile))
	return parse(src)
	parse = func(&s) {
		while(s.valid() ) {
			nm=s.move()
			not(s.ch()) break;
			not(nm.eq('class')) break;
			className=s.findPos('{',0,1).trim()
			src=s.match(1)
			conf("class.$className", src, true)
			print("class $className loaded")
		}
	};
	checkClass = func(&s) {
		c=s.next().ch()
		while(c.eq('-')) c=s.next().ch()
		if(c.eq('{')) return true;
		return false;
	};		
}
class(obj, param ) {
	not(typeof(obj,'node'))  return print("class 객체 미설정")
	not(param) return print("class 매개변수 미설정")
	if(typeof(param,'array') ) pa=param;
	else pa=split(param)
	while(name, pa) {
		src=conf("class.$name")
		not(src) return print("class $name 클래스 소스 미등록")
		parse(obj, src)
	}
	return obj;
	parse=func(obj, &s) {			
		init='', funcs='';
		n=0;		
		while(s.valid()) {
			if(funcCheck(s)) {
				sp=s.cur()
				s.next().ch()
				s.match()
				s.match(1)
				src=s.value(sp, s.cur(), true)
				funcs.add(src)
			}	else {
				line=s.findPos("\n").trim()
				if(n) init.add("\n")
				init.add(line)
				n++;
			}
		}
		print("==>", init, funcs)
		
		if(init) {
			src="onInit() {$init}"
			obj[$src]
		}
		if(funcs) {
			obj[$funcs]
		}
	};
	funcCheck = func(&s) {
		not(s.ch()) return false;
		c=s.next().ch()
		if(c.eq('(')) {
			s.match()
			c=s.ch()
			if(c.eq('{') return true
		}
		return false
	};
}
</func>


