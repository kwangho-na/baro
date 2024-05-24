<func note="UI 위젯함수">
	@ui.widgets(baseId, &src) {
		if(typeof(src,'string')) {
			return Cf.sourceApply(#[<widgets base="${baseId}">${src}</widgets>])
		}
		if(typeof(src,'node')) { 
			base=src;
			arr=base.addArray("@widgets").reuse();
			data=_make(base, arr)
			Cf.sourceApply(#[<widgets base="${baseId}">${data}</widgets>])
			return arr;
		}
		_make=func(node, arr, base) {
			not(base ) base=node;
			rst='';
			while(cur, node) {
				if(cur.childCount()) {
					str=_make(cur, arr, node)
					if(str) rst.add(str);
				}
				cur.inject(id, tag)
				if( tag.eq('input','combo')) {
					rst.add(#[<${tag} id="${id}"></${tag}>]);
					arr.add("$tag.$baseId:$id")
				}
			}
			return rst;
		};
	}
	@ui.get(id, tag, wid) { return object("$tag.$id:$wid") } 
</func>

<func note="UI 유틸리티 함수">
	@ui.padding(rect) {
		not(typeof(rect,'rect')) return rc(0,0,1,1)
		size=args().size();
		if(size==2) {
			args(1,padding)
			return rect.incr(padding);
		}
		rect.inject(x,y,w,h)
		if(size==3) {
			args(1,a, b)
			x+=a, w-=2*a
			y+=b, h-=2*b
			return rc(x,y,w,h)
		}
		if(size==4) {
			args(1,a,b,c)
			x+=a, w-=a
			y+=b, h-=b
			w-=c
			return rc(x,y,w,h)
		}
		args(1,a,b,c,d)
		x+=a, y+=b
		w-=c, h-=d
		return rc(x,y,w,h)
	}
	@ui.per(total, per) {
		// total:100=per:x
		a=per*100;
		a/=size;
		return a;
	}
	@ui.rate(total, curVal, baseVal) {
		size=args().size();
		if(size==2) { 
			a=curVal * total;
			a/=100;
		} else {
			a=curVal * baseVal;
			a/=total;
		}
		return a;
	}
	@ui.setNodeRect(node, rect, pfn) {
		tag=node.tag;
		if( pfn && tag.eq('button','title','label') ) {
			pfn.get("arrDrawNodes").add(node)
			if(tag.eq('button')) pfn.get("arrMouseNodes").add(node)
		}
		p=node.ref("&center")
		if(p) {
			a=p.findPos(',').trim()
			b=p.trim()
			not(b) b=a
			rect=rect.center(a,b)
		}
		node.rect=rect
		return node
	}
	@ui.setChildRect(node, parent, pfn) {
		if(pfn) {
			arrDrawNodes=pfn.get("arrDrawNodes")
		} else {
			pfn=Cf.funcNode()
			arrDrawNodes=node.addArray('arrDrawNodes').reuse()
			arrMouseNodes=node.addArray('arrMouseNodes').reuse()
		}
		 
		node.inject(tag, rect);
		not(typeof(rect,'rect')) return print("@ui.setChildRect $node 에 영역이 설정되지 않았습니다")
		not(tag) tag='box';
		vbox=true;
		if(tag.eq('row','hbox')) {
			vbox=false;
		}
		info=node.info
		if(parent) {
			if(info) {
				if(tag.eq('row')) parent.range=info
			} else {
				if(parent.isset('range')) info=parent.range
			}
		}
		if(info) {
			arr=info.split()
			sep='', idx=0;
			while(val, arr, num ) {
				if(num) sep.add(',')
				if(val.ch('*')) {
					not(val.eq('*')) val=val.value(1)
					sep.add(val);
				} else {
					sep.add(val)
					arr.set(num, node.child(idx))
					idx++
				}
			}
			while(rc, @ui.boxRect(vbox,node.rect,sep,1), idx ) {
				cur=arr.get(idx)
				if(typeof(cur,'node')) {
					@ui.setNodeRect(cur, rc, pfn);
				}
			}
		} else {
			rect.inject(x,y,w,h)
			if(vbox) {
				while(cur, node) {
					ch=@ui.childHeight(cur)
					@ui.setNodeRect(cur, rc(x,y,w,ch), pfn)
					y+=ch;
					if(cur.childCount()) @ui.setChildRect(cur, node, pfn)
				}
			} else {
				while(cur, node) {
					cw=@ui.childWidth(cur)
					@ui.setNodeRect(cur, rc(x,y,cw,h), pfn);
					x+=cw;
					if(cur.childCount()) @ui.setChildRect(cur, node, pfn)
				}
			}
		}
	}
	@ui.childHeight(node, parent) {
		if(node.height) return node.height;
		tag=node.tag;
		not(node.childCount()) {
			if(parent) 
				node.height=nvl(parent.height,35) 
			else
				node.height=35
			return node.height;
		}
		not(tag) tag='box';
		vbox=true;
		if(tag.eq('row','hbox')) {
			vbox=false;
		}
		sum=0;
		if(vbox) {
			while(cur,node) {
				sum+=@ui.childHeight(cur);
			}
		} else {
			while(cur,node) {
				h=@ui.childHeight(cur);
				if(sum<h) sum=h
			}
		}
		return sum;
	}
	@ui.childWidth(node, parent) {
		if(node.width) return node.width;
		not(node.childCount()) {
			not(node.width) {
				if(parent) 
					node.width=nvl(parent.width, 60) 
				else
					node.width=60
			}
			return node.width;
		}
		tag=node.tag;
		not(tag) tag='box';
		hbox=false;
		if(tag.eq('row','hbox')) {
			hbox=true;
		}
		sum=0;
		if(hbox) {
			while(cur, node) {
				sum+=@ui.childHeight(cur);
			}
		} else {
			while(cur,node) {
				h=@ui.childHeight(cur);
				if(sum<h) sum=h
			}
		}
		return sum;
	}
	@ui.boxRect(vbox, rect, &info, gab ) {
		base=null;
		not( typeof(rect,"rect") ) return print("[boxRect] 영역 오류");
		if( margin ) rect.margin( margin);
		not( gab ) gab=0;
		rect.inject( x,y,w,h);
		arr=_arr(), keys=null;
		if( typeof(info,"num") ) {
			num=info.toInt();
			if(vbox) arr.div(num, h, y) else  arr.div(num, w, x);
		} else {
			not( info ) return print("[boxRect] 영역정보 오류");
			if( vbox) arr.div(info, h, y) else  arr.div(info, w, x);
		}
		num=arr.size()-1;
		last=num-1;
		array=_arr();
		while( n=0, n<num, n++ ) {
			if( vbox ) {
				y=arr.get(n);
				h=arr.dist(n,1);
				if(gap && n.ne(last) ) {
					h-=gap;
				}
			} else {
				x=arr.get(n);
				w=arr.dist(n,1);
				if(gap && n.ne(last) ) {
					w-=gap;
				}
			}
			array.add(rc(x,y,w,h))
		}
		return array;
	}
	vbox(rect, &info, gap) {
		return @ui.boxRect(true, rect, info, gap);
	}
	hbox(rect, &info, gap) {
		return @ui.boxRect(false, rect, info, gap);
	}
</func>
