<func>
	@page.make() {
		switch(args().size()) {
		case 1: 
			args(src)
			base='dev', id='p1', props=''
		case 2:
			args(id,src)
			base='dev', props=''		
		case 3:
			args(id,props,src)
			base='dev'
		case 4:
			args(base,id,props,src)
		}
		ss=ff('<pages base="{base}"><page id="{id}" {props}>{src}</page></pages>');
		Cf.sourceApply(ss)
	}
	@page.control() {
		
	}
</func>

<func>
	addFunc(src, ref) {
		src=ff('<func {ref?ref="@"}>{src}</func>')
		Cf.sourceApply(src)
	}
	addMember(obj, path) {
		src=fileRead(path)
		if(src) obj[$src]
	}
	ff(&s) {
		fn=Cf.funcNode('parent')
		a=args(1)
		ss=''
		while(s.valid()) {
			left=s.findPos('{')
			ss.add(left)
			not(s.valid()) break;
			prop=s.findPos('}')
			k=prop.findPos('?').trim()
			if(prop.ch()) {
				v=when(typeof(k,'num'),a.get(k),fn.get(k));
				if( v ) {
					ss.add(parse(prop,v))
				}
			} else {
				if(typeof(k,'num')) ss.add(a.get(k))
				else ss.add(fn.get(k))
			}
		}
		return ss
		
		parse=func(&s,v) {
			ss=''
			while(s.valid()) {
				left=s.findPos('@')
				ss.add(left)
				not(s.ch()) break;
			}
			return ss;
		};
	}  
</func>