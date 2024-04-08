<widgets base="dev">
	<page id="dbFields">
		<hbox>
			<combo id="cbo_dbsel">
			<space>
		</hbox>
		<grid id="g">
		<hbox>
			<button id="ok" text="ok">
			<space>
		</hbox>
	</page>
</widgets>
~~
p=page('dev:dbFields')

p.open()

g=p.get('g')
g.is('stretchLast', true)
g.is('selection','single')
g.is('resizeWidth', true)
g.model('field:필드명#120, type:필드타입, size:크기, def:기본값, note:설명, nullCheck:NULL체크')


a=object('@inc.userFunc').get('hbox')

g.rect().size().inject(w,h)


aa=@util.arrDiv(w-5,'120,80,80,80,*,60')
g.headerWidth(aa)


root=object('grid.dbFields')
g.model(root)
c=root.addNode().with(field:'aaa', type:'text')

g.update()
last=g.lastNode(true)
~~
g.is('sortEnable', false)

onSort(idx,a,b) {
	return a.idx.gt(b.idx)
}
onKeyDown(k,c) {
	g=this
	checkSort=false
	if(k==KEY.Up) {
		c=g.current()
		idx=c.idx
		d=g.prevNode(c)
		if(d) {
			c.idx=d.idx
			d.idx=idx
			checkSort=true
		}
	} else if(k==KEY.Down) {
		c=g.current()
		idx=c.idx
		d=g.nextNode(c)
		if(d) {
			c.idx=d.idx
			d.idx=idx
			checkSort=true
		}
	} else {
		print("key down >>",k,c)
	}
	if(checkSort) {
		g.update()
		return true
	}
}
ff(&s) {
	fn=Cf.funcNode('parent')
	a=args(1)
	ss=''
	while(s.valid()) {
		left=s.findPos('{')
		ss.add(left)
		not(s.valid()) break;
		k=s.findPos('}').trim()
		if(typeof(k,'num')) ss.add(a.get(k))
		else ss.add(fn.get(k))
	}
	return ss
}  
baseId() {
	not(this.var(baseId)) {
		p=this.pageNode()
		base=p.var(baseCode).replace(':','_')
		base.add('_',this.id)
		this.var(baseId, base)
	}
	return this.var(baseId)	
}
setInputFields() {
	base=this.baseId()
	arr=this.get('@inputFields')
	not(valid(arr)) {
		fa=this.fields()
		src='';
		while(c,fa) {
			c.inject(field, text)
			src.add( ff('<input id="{0}"></input>', field) )
		}
		Cf.sourceApply( ff('<widgets base="{base}">{src}</widgets>') )
		arr=this.addArray('@inputFields')
		while(c,fa) {
			c.inject(field, text)
			input=object('input.{0}:{1}',base, field)
			arr.add(input)
		}
	}
	return arr
}
~~
root.parseJson(#[[
	{field:bbb, type:varchar, size:200, nullCheck:true},
	{field:ccc, type:varchar, size:200, nullCheck:true},
]])
~~
g[
	onMouseDown(p, c) {
		hh=this.headerHeight()
		node=this.at(p.incrY(hh,true))
		if(node) {
			row=node.index()
			field=node.var(code)
			print("xxx", row, field)
		}
	}
]
g[
	onSort(a,b,c) {
		this.var(numSort, a)
	}
	
	onDrawHeader(dc, text, idx, asc) {
		rc=dc.rect(), fields=this.fields();
		last=fields.childCount()-1;
		if(last.eq(idx)) {
			dc.rectLine(rc, 4,'#a0a0a0');
		} else {
			dc.rectLine(rc, 34,'#a0a0a0');
		}
		sortIdx=this.var(numSort
		if(this.is('sortEnable') && idx.eq(sort) ) {
			if(asc) {
				icon="vicon.bullet_arrow_up";
			} else {
				icon="vicon.bullet_arrow_down";
			}
			rcIcon=rc.rightCenter(16,16,-5);
			dc.text(rc.incrX(10), text );
			dc.image(rcIcon, icon);
		} else {
			dc.text(rc, text, 'center');
		}
	}
]
~~
pt=pt(200,100)

x=g.at(pt )
if(x) {
	field=x.var(code)
	
}


g.is('sortEnable', false)
g.sort(1, 'asc')

~~
<func>
	@grid.drawHeader(dc, text, index, order) {
		rc=dc.rect(), fields=this.fields();
		last=fields.childCount()-1;
		if(last.eq(index)) {
			dc.rectLine(rc, 4,'#a0a0a0');
		} else {
			dc.rectLine(rc, 34,'#a0a0a0');
		}
		if( index.eq(sortIndex) ) {
			if(order) {
				icon="vicon.bullet_arrow_up";
			} else {
				icon="vicon.bullet_arrow_down";
			}
			rcIcon=rc.rightCenter(16,16,-5);
			dc.text(rc.incrX(10), text );
			dc.image(rcIcon, icon);
		} else {
			dc.text(rc, text, 'center');
		}
	} 
</func>



<func>
	@grid.drawState(dc, node, state, last, clr) {
	  rc=dc.rect();
	  not(clr) clr=color("#c96");
	  ty=when(last, 24, 234);
	  if( state & STYLE.Selected ) {
		dc.fill(rc, clr.darkColor(150) );
		dc.rectLine(rc,3, clr.lightColor(120), 1 );
		dc.pen(clr.lightColor(220));
	  } else if( state & STYLE.MouseOver ) {
		dc.fill(rc,'#def' );
		dc.pen(clr.darkColor(150));
		dc.rectLine(rc,ty);
	  } else {
		dc.fill(rc,'#ffffff');
		dc.rectLine(rc,ty,'#ddd');
		dc.pen(clr.darkColor(200));
	  }
	  return rc.incrX(5);
	}
	@grid.drawHeader(dc, text, index, order) {
		rc=dc.rect(), fields=this.fields();
		last=fields.childCount()-1;
		if(last.eq(index)) {
			dc.rectLine(rc, 4,'#a0a0a0');
		} else {
			dc.rectLine(rc, 34,'#a0a0a0');
		}
		if( index.eq(sortIndex) ) {
			if(order) {
				icon="vicon.bullet_arrow_up";
			} else {
				icon="vicon.bullet_arrow_down";
			}
			rcIcon=rc.rightCenter(16,16,-5);
			dc.text(rc.incrX(10), text );
			dc.image(rcIcon, icon);
		} else {
			dc.text(rc, text, 'center');
		}
	} 
	@grid.draw(dc, node, index, state) {
	  last=this.columnCount()-1;
	  rc=@grid.drawState(dc, node, state, index.eq(last), pp().var(baseColor) );
	  field=this.field(index);
	  dc.text(rc, node.get(field));
	}
	@grid.model() {
		
	}
	@grid.setFieldWidth(&fields, info) {
		n=0, ss='';
		grid=this
		grid.rect().inject(x,y,w,h)
		arr=@util.arrDiv(w,info)
		while( fields.valid() ) {
			left=fields.findPos(',')
			not(left.ch()) continue
			field=left.findPos('#').trim()
			not(field.find(':')) {
				field=Cf.val(field,':', field)
			}
			width=arr.get(n++).toInt()
			ss.add(field,'#',width,';')
		}
		print("ss==$ss")
		return grid.fields(ss)
	}
	@util.arrDiv(size, info, arr) {
		not(arr) arr=_arr()
		a=_arr()
		a.div(info, size)
		last=a.size()-1 
		while(n=0, n<last, n++) {
			w=a.dist(n,1) 
			arr.add(w)
		}
		return arr;
	}

</func>
