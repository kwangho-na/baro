class func:array {
	@data.filter(node, field, val) {
		arr=_arr()
		while(cur, node) {
			if(cur.cmp(field,val)) arr.add(cur)
		}
		return arr;
	}
	@data.fieldArr(node, field) {
		arr=_arr()
		while(cur, node) arr.add(cur.get(field))
		return arr;
	}
	@data.arrayData(param) {
		arr=null
		print("array data", args())
		if(typeof(param,'array')) {
			arr=param
			args().pop()
		} else {
			arr=class("data").tempArray()
		}
		switch(args().size()) {
		case 0: 
			return arr;
		case 1: 
			args(a)
			return arr.recalc(a)
		case 2:
			args(a,b)
			return arr.recalc(a,b)
		case 3:
			args(a,b,c)
			return arr.recalc(a,b,c)
		default:
		}
		return arr;
	}
	@data.nodeData() {
		node=null
		print("node data", args())
		if(typeof(param,'node')) {
			node=param
			args().pop()
		} else {
			node=class("data").tempNode()
		}
		switch(args().size()) {
		case 0: 
			return node;
		case 1: 
			args(a)
			if(typeof(a,'string')) {
				return node.parseJson(a)
			} else if(typeof(a,'node')) {
				return node.copyNode(a)
			}
			return arr.recalc(a)
		case 2:
			args(a,b)
			return arr.recalc(a,b)
		case 3:
			args(a,b,c)
			return arr.recalc(a,b,c)
		default:
		}
		
	}
}
class data {
	initClass() {
		this.cycleNodeNum=0;
		this.cycleArrayNum=0;
		@maxNodeSize=100;
		@maxArrSize=4096;
		@nodes=object('data.nodes')
		@arrays=object('data.arrays')
		@tempNodes=object('data.temps')
	}
	tempNode(data) {
		_val=func(cur) {
			cur.removeAll(true)
			if(typeof(data,'node')) {
				cur.copyNode(data)
			} else if(typeof(data,'string')) {
				cur.parseJson(data)
			}
			return cur;
		};
		idx=this.incrNum("tempNodeIndex")
		size=tempNodes.childCount()
		if(idx.ge(size)) {
			if(size.lt(maxNodeSize)) return _val(tempNodes.newNode())
			this.incrNum("cycleNodeNum")	
			this.set("tempNodeIndex", 0)
			idx=this.incrNum("tempNodeIndex")
		}
		return _val(tempNodes.child(idx))
	}
	tempArray() {		
		idx=this.incrNum("tempArrayIndex")
		size=arrays.localArray()
		if(idx.ge(size)) {
			if(size.lt(maxArrSize)) return arrays.newArray();
			this.incrNum("cycleArrayNum")	
			this.set("tempArrayIndex", 0)
			idx=this.incrNum("tempArrayIndex")
		}
		return arrays.localArray(idx)
	}
	dataNode(name,target) {
		cur=nodes.addNode(name)
		sub=cur.addNode()
		if(target) sub.copyNode(target)
		return sub;
	}
	dataNodeReset(name) {
		cur=nodes.addNode(name)
		cur.removeAll(true)
		return cur;
	}
	recalc() {
		arr=this.tempArray()
		return call(@data.arrayData, args() );
	}
}
class DevData {
	db=Baro.db('config')
	initClass() {
		class(this,'data')
	}
	/* 클래스 소스 정보 */
	classInfo(param) {
		root=object('data.classInfo')
		if( typeof(param,'array')) {
			_reset(param)
		} else if( typeof(param,'bool')) {
			if(param) {
				db=Baro.db('config')
				node=db.fetchAll("select grp,cd from conf_info where grp='class'  ") 
				while(cur,node) cur.name=cur.cd.lower()
				_reset(node.sort('name'))
			} else {
				_reset()
			}
		}
		return root;
		
		_reset=func(a) {
			this.dataNodeReset('classTarget')
			root.removeAll(true)
			if(typeof(a,'array')) {
				while(cur, a ) this.classInfoTree(cur)
			}
		};
	}
	classInfoTree(target) {
		target.inject(grp, cd)
		root=this.classInfo()
		s=cd
		s.ref()
		_checkNext=func(&s, sep) {
			c=s.next().ch()
			return when(c.eq(sep), true)
		};
		parent=root
		while(s.valid()) {
			not(s.ch()) break;
			if( _checkNext(s,'/')) {
				name=s.move() s.incr()
				parent=parent.addNode(name)
				not(parent.type) {
					parent.name=name
					parent.type='path'
				}
				continue;
			} 
			if( _checkNext(s,':')) {
				name=s.move() s.incr()
				root=_addGroup(parent, name, left(cd,':') )
				name=s.trim()
				node=root.addNode()
				node.name=name
				node.type='leaf'
				node.leaf=true
			} else {
				name=s.trim()
				parent=parent.addNode(name)
				not(parent.type) {
					parent.name=name
					parent.type='path'
				}
				_addGroup(parent, name, cd )
			}
			break;
		}
		return root;
		
		_addGroup = func(parent, name, base) {
			root=parent.addNode(name) if(root.type) return root;
			root.type='base'
			root.name=name 
			root.baseName=base
			parent.target=this.dataNode('classTarget',target)
			// 레이아웃정보
			src=conf("layoutSource.$base")
			if( src ) {
				node=root.addNode()
				node.type='layout'
				node.name='레이아웃'
				node.src=src
			}
			tm=conf("classModify.$base")
			if( tm ) root.modify=System.date(tm,'yyyy-MM-dd hh:mm')
			// 함수정보
			src=conf("funcSource.$base")
			if( src) {
				node=root.addNode()
				node.type='funcGroup'
				node.name='공통함수'
				this.parseFuncChild(node, base, src)
			}
			// 설정정보
			if(db.count("select count(1) from conf_info where grp='${base}' ")) {
				node=root.addNode()
				node.type='confInfo'
				node.name='설정정보'
				this.parseConfChild(node,base)
			} 
			return root;
		};
	}
	parseConfChild(node, base) {
		db.fetchAll("select grp, cd as name, data as src from conf_info where grp='${base}'", node)
		while(cur, node) {
			cur.type='conf' 
		}
	}
	parseFuncChild(node, base, &src) {
		 
		if( db.count("select count(1) from conf_info where grp='funcSource' and cd like '${base}:%' ")) {
			db.fetchAll("select cd, data as src from conf_info where grp='funcSource' and cd like '${base}:%' ", node)
			while(cur, node) {
				cur.type='funcSource'
				cur.name=right(cur.cd,':')
				_parse(cur, cur.src)
			}
		} else {
			_parse(node,src)
		}
		_parse=func(root,&s) {
			
		};
	}
}