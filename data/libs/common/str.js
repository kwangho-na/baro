<func>
	@str.fmt(&s) {
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
