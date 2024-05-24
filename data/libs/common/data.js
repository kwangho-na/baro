<func>
@data.makeTree(node, &s) {
	not(node) return print("@data.makeTree 노드오류"); 
	arr=[]
	arr.add(node);
	first=true;
	while(s.valid()) {
		if(lineBlankCheck(s)) {
			s.findPos("\n");
			continue;
		}
		cnt=indentCount(s);
		depth=node.var(startDepth);
		if(typeof(depth,'num')) {
			if(depth.eq(0)) {
				if(first) {
					start=cnt-1;
					node.var(startDepth, start)
				}
			}
			first=false;
		} else {
			node.var(startDepth, cnt);
		}
		idx=cnt-node.var(startDepth);
		sp=s.cur();
		line=s.findPos("\n");
		not(line.ch()) break;
		parent=arr.get(idx);
		not(parent) return print("makeTree 오류 부모노드를 찾을수 없습니다", idx );
		cur=parent.addNode();
		setArray(arr, idx+1, cur);
		if(line.find('{')) {
			s.pos(sp);
			name=s.findPos('{',0,1).trim();
			data=s.match() if(typeof(data,"Bool")) return print("$name 트리데이터 매칭오류", idx );
			
			cur.set("text", name);
			cur.parseJson("{$data}");
			s.findPos("\n");
		} else {
			cur.set("text", line.trim()); 
		}
	}
}
@data.makeLayout(node, &s ) {
	not(node) return print("@data.makeLayout 노드오류"); 
	arr=[]
	arr.add(node);
	first=true;
	while(s.valid()) {
		if(lineBlankCheck(s)) {
			s.findPos("\n");
			continue;
		}
		cnt=indentCount(s);
		depth=node.var(startDepth);
		if(typeof(depth,'num')) {
			if(depth.eq(0)) {
				if(first) {
					start=cnt-1;
					node.var(startDepth, start)
				}
			}
			first=false;
		} else {
			node.var(startDepth, cnt);
		}
		idx=cnt-node.var(startDepth);
		sp=s.cur();
		line=s.findPos("\n");
		not(line.ch()) break;
		parent=arr.get(idx);
		not(parent) return print("@data.makeLayout 오류 부모노드를 찾을수 없습니다", idx );
		cur=parent.addNode();
		setArray(arr, idx+1, cur);
		if(line.find('{')) {
			s.pos(sp);
			line=s.findPos('{',0,1) 
			data=s.match() if(typeof(data,"Bool")) return print("@data.makeLayout $tag 레이아웃 매칭오류", idx );
			s.findPos("\n");
		} else {
			data='';
		}		
		tag=line.move()
		if(line.ch(':')) line.incr();
		if(line.ch()) {
			if(line.ch('[')) {
				info=line.match();
				cur.info=info;
			}
			text=when(line.valid(), line.trim())
			if(text) cur.text=text;
		}
		cur.tag=tag;
		if(data) cur.parseJson(data);
	}
}
@data.findField(node, field, val) {
	if(node.cmp(field, val)) return node;
	while(cur, node ) {
		not(typeof(cur,'node')) continue;
		if(cur.cmp(field, val)) return cur;
		if(cur.childCount()) {
			find=@data.findField(cur,field, val);
			if(find) return find;
		}
	}
	return null;
}

 
</func>
