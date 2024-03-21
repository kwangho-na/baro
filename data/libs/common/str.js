<func>
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
</func>

<func>
showInputs() {
	grid=this
	cur=grid.lastNode(true)
	not(cur) return;
	fields=grid.fields()
	hh=grid.headerHeight()
	base='inline'
	this.makeInput(base,fields.size())
	while(n=0, n<fields.size(), n++) {
		rc=rc(grid.nodeRect(cur,n)).incrXW(1,-1)
		input=object("input.${base}:input_$n")
		input.parentWidget(grid)
		input.styleSheet('border: 1px solid #449')
		input.move(rc.incrY(hh,true))
		input.show()
	}
	input=object("input.${base}:input_0").focus()
}
makeInput(base,num) {
	if(Cf.getObject("input","${base}:input_0")) return;
	evt=#[
		onKeyDown(k,s){ this.parentWidget().keydown(k,s) }
	]
	ss=''
	while(n=0,n<num,n++) ss.add(ff('<input id="input_{n}">{evt}</input>'))
	Cf.sourceApply(ff('<widgets base="{base}">{ss}</widgets>'))
}
hideInputs() {
	grid=this
	fields=grid.fields()
	while(n=0, n<fields.size(), n++) {
		input=object("input.aa:input_$n")
		input.hide()
	}	
}	
</func>
