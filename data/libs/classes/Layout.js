class Layout { 
	maps=object('map.layout')
	currentId='';
	templateId='';
	resultValue='';
	path() {
		s=conf('layout.path')
		not(isFolder(s)) s='';
		not(s) {
			s=Cf.val(System.path(), '/pages/layout')
			conf('layout.path', s, true)
		}
		return s;
	}
	find(id) {
		if( id.find('.')) {
			id.split('.').inject(tid,id)
			node=maps.get(tid)
			if(node) return node.get(id);
		} else {
			while(tmp, maps) {
				cur=tmp.get(id)
				if(cur) return cur;
			}
		}
		return;
	}
	layoutSource(id) {
		cur=this.find(id)
		return when(cur, cur.src)
	}
	load(id) {
		base=null;
		if( id.find('.')) {
			id.split('.').inject(base,id)
			node=maps.get(base);
			not(node) {
				this.readAll()
			}
		}
		cur=this.find(id);
		not(cur) return print("layout load fail ($id 미정의)")
		not(cur.src) return print("layout source 미정의 (id=$id)")
		not(base) {
			node=cur.parentNode();
			if(node) base=node.templateId
			not(base) base='common'
		}
		cur.inject(tag, id)
		obj=Cf.getObject(tag,"$base:$id")
		if( typeof(obj,"node") ) {
			return obj;
		}
		Cf.sourceApply(#[
			<widgets base="${base}">${cur.src}</widgets>
		]);
		print("load=> $tag", base, id)
		return Cf.getObject(tag,"$base:$id");
	}
	readAll(path, pathLen) {
		not(path) path=this.path()
		not(pathLen) pathLen=path.size()
		fo=Baro.file('layout')
		fo.list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath)
				if(type=='folder') {
					this.readAll(fullPath,pathLen)
					continue;
				}
				src=stripJsComment(fileRead(fullPath))
				relative=fullPath.trim(pathLen+1) 
				tid=relative.findPos('.')
				this.readSource(src, tid, fullPath)
			}
		}); 
	}
	readSource(&s, tid, fullPath) {
		getTag=func(&s) {
			not(s.ch('<')) return;
			s.incr()
			return s.move()
		};
		idValue=func(&s) {
			if(s.find('id=')) s.findPos('id=') else s.findPos('base=')
			c=s.ch() not(c) return;
			if(c.eq()) ss=s.match() else ss=s.move()
			return ss;
		}
		modify=Baro.file().modifyDate(fullPath)
		parse=func(&s, tid) {
			node=maps.get(tid)
			if(node && modify.eq(node.modifyDate) ) return node;
			print("layout parse templateId==$tid [path:$fullPath]");
			while(s.valid()) {
				tag=getTag(s) not(tag) break;
				sp=s.cur()
				ss=s.match("<$tag","</$tag>")
				if(typeof(ss,'bool')) return;
				prop=ss.findPos('>')
				propId=idValue(prop)
				print("parse tag:$tag tid:$tid id:$propId")
				if(tag=='template') {
					not(propId) propId=tid
					parse(ss, propId)
				} else {
					not(node) {
						node=maps.addNode(tid)
						node.templateId=tid;
						node.path=fullPath
						node.modifyDate=modify
					}
					cur=node.get(propId)
					not(cur) {
						cur=node.addNode(propId)
						cur.id=propId
						cur.path=fullPath
						cur.modifyDate=modify
					}
					cur.tag=tag
					ep=s.cur()
					cur.src=s.value(sp,ep,true);
				}
			}
			return;
		}; 
		return parse(s, tid);
	}

	/*
		실시간 레이아웃 소스처리
	*/
	getSource(id) {
		not(id) return print("layout getSource 아이디 미정의");
		if( id.find('.')) {
			id.split('.').inject(pid,id)
		} else {
			pid=null
		}
		return this._findBasePath(pid,id)
	}
	getTemplateSource(id) {
		return this._findBasePath(id)
	}
	_findBasePath(base, id, path, pathLen) {
		not(path) path=this.path()
		not(pathLen) pathLen=path.size()
		ss=''
		fo=Baro.file('layout')
		fo.list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath)
				if(type=='folder') {
					ok=this._findBasePath(base,id,fullPath,pathLen) not(ok) continue;
					break;
				}
				src=stripJsComment(fileRead(fullPath))
				rst=this._findSrcById(src,base,id)
				if(rst) {
					relative=fullPath.trim(pathLen+1) 
					tid=base
					not(tid) {
						tid=this.member(templateId)
						not(tid) tid=relative.findPos('.')
					}
					maps=object('map.layout')
					modify=Baro.file().modifyDate(fullPath)
					node=maps.get(tid)
					not(node) {
						node=maps.addNode(tid)
						node.templateId=tid;
						not(node.path) {
							node.path=fullPath
							node.modifyDate=modify
						}
						cur=node.get(id)
						not(cur) cur=node.addNode(id)
						cur.id=id;
						cur.path=fullPath
						cur.modifyDate=modify
						cur.src=rst;
					}
					ss.add(rst)
					break;
				}
			}
		}); 
		return ss;
	}
	_findSrcById(&s,base,id) {
		getTag=func(&s) {
			not(s.ch('<')) return;
			s.incr()
			return s.move()
		};
		idValue=func(&s) {
			if(s.find('id=')) s.findPos('id=') else s.findPos('base=')
			c=s.ch() not(c) return;
			if(c.eq()) ss=s.match() else ss=s.move()
			return ss;
		} 
		parse=func(&s,id) {
			while(s.valid()) {
				tag=getTag(s) not(tag) break;
				sp=s.cur()
				ss=s.match("<$tag","</$tag>")
				if(typeof(ss,'bool')) return;
				prop=ss.findPos('>')
				propId=idValue(prop)
				if( id.eq(propId)) {
					this.member(currentId, id)
					ep=s.cur()
					return s.value(sp,ep,true);
				}
			}
			return;
		};
		while(s.valid()) {
			tag=getTag(s) not(tag) break;
			ss=s.match("<$tag","</$tag>")
			if(typeof(ss,'bool')) return;
			prop=ss.findPos('>')
			propId=idValue(prop)
			if(tag=='template') {
				ok=true;
				if(base) ok=propId.eq(base)
				if(ok) {
					this.member(templateId, propId)
					print("xxx propId == $propId", propId)
					not(id) return ss;
					rst=parse(ss,id)
					if(rst) return rst;
				}
			}
			if( id.eq(propId)) {
				this.member(currentId, id)
				return Cf.val("<$tag $prop>$ss</$tag>")
			}
		}
		return;
	}
}
 