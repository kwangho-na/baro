<func>
	@menu.makeMenu() {
		db=Baro.db('ggs')
		not(db.open()) db.open('D:\APP\ggs_local\data\config.db')
		menus=db.fetchAll(#[
			SELECT seq, code as id, pcode as pid, value as text, depth, url, icon, ref1, ref5 as type, sort 
			FROM comm_tree WHERE  ref='MN' and depth>0 
			ORDER BY depth, sort, pcode, seq
		], true)
		this.menuTree(menus)
		this.var(menuText, this.makeMenuText(this))
		this.var(toolbarText, this.makeToolbar(menus))
		return this;
	}
	@menu.makeTree(menus ) {
		root=this
		root.removeAll()
		while(cur, menus) {
			parent=root.findOne('id',cur.pid)
			not(parent) parent=root
			parent.addNode(cur,true)
		}
		return root;
	}
	@menu.makeMenuText(node, depth) {
		not(depth) dept=0
		ss='';
		text=node.text
		if(text.eq('-')) {
			ss.add('-,')
			return s;
		}
		pid=node.pid
		print("pid==$pid", text, pid)
		
		if( pid.eq('ROOT') ) {
			ss.add("{id:ROOT, ")
		} else {
			node.inject(id, text,icon)
			ss.add("{id: $id, text:$text, icon:$icon, ")
		}
		if( node.size()) {
			ss.add("type:menu, actions:[")
			while(sub, node) {
				ss.add( this.makeMenuText(sub, depth+1) )
			}
			ss.add("]}")
		} else {
			ss.add("}")
		}
		if(depth) ss.add(",")
		return ss
	}
	@menu.makeToolbar(menus) {
		ss=''
		prev=''
		while(cur, menus) {
			not(cur.ref1.eq('tool')) continue
			not( prev.eq(cur.pid) ) {
				if(prev) ss.add("-,")
				prev=cur.id
			}
			ss.add("${cur.pid}.${cur.id},")
		}
		return ss;
	}
</func>
