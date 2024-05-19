class nodes {
	findId(node, id) {
		return _find(node, 'id', id, true)
	}
	findTag(node, tag) {
		return _find(node, 'tag', tag, true)
	}
	findName(node, name) {
		return _find(node, 'name', name, true)
	}
	findField(node, field, val) {
		return _find(node, field, val, true)
	}
	moveChild(node, target) {
		while(cur, node) {
			target.pushNode(cur)
		}
		node.reuse()
	}
	copyChild(node,target) {
		
	}
	copyNode(node, cur) {
		node.copyNode(cur)
		
	}
	
	_find(node, field, val, child, arr ) {
		while(cur, node) {
			if(cur.cmp(field,val) ) {
				not(arr) return cur;
				arr.add(cur)
			}
			if( child && cur.childCount()) {
				find=this._find(node, field, val, child, arr)
				if(find) {
					not(arr) return find;
				}
			}
		}
		return;
	}
}

class utils {
	isClass(name) {
		map=object('map.classes')
		node=class('nodes').findName(map, name)
		return typeof(node,'node')
	}
	loadClass() {
		classLoadAll()
	}
	
}