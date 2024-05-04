class Layout { 
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
	templateNode(tid) {
		maps=object('map.layout')
		node=map.get(tid)
		not(node) {
			
		}
	}
	findNode(id) {
		search=func(root,id) {
			while(cur, root) {
				if(cur.cmp('id',id)) return cur;
			}
			return;
		};
		maps=object('map.layout')
		if( id.find('.')) {
			id.split('.').inject(tid,id)
			return search(this.templateNode(tid),id)
		} else {
			while(tmp, maps) {
				cur=search(tmp,id)
				if(cur) return cur;
			}
		}
		return;
	}
	
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
	load(base, id) {
		src=this.getSource(id) not(src) return print("layout load fail ($id 미정의)")
		Cf.sourceApply(#[
			<widgets base="${base}">${src}</widgets>
		]);
	}
	loadAll(path, pathLen) {
		not(path) path=this.path()
		not(pathLen) pathLen=path.size()
		fo=Baro.file('layout')
		fo.list(path, func(info) {
			while(info.next()) {
				info.inject(type, name, fullPath)
				if(type=='folder') {
					this.loadAll(fullPath,pathLen)
					continue;
				}
				src=stripJsComment(fileRead(fullPath))
				relative=fullPath.trim(pathLen+1) 
				tid=relative.findPos('.')
				this.loadSource(src, tid, fullPath)
				if(rst) {
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
	}
	loadSource(&s, tid, fullPath) {
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
		parse=func(&s,node) {
			while(s.valid()) {
				tag=getTag(s) not(tag) break;
				sp=s.cur()
				ss=s.match("<$tag","</$tag>")
				if(typeof(ss,'bool')) return;
				prop=ss.findPos('>')
				propId=idValue(prop)
				ep=s.cur()
				src=s.value(sp,ep,true);
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
				templateId=nvl(propId, tid)
			}
			if( id.eq(propId)) {
				this.member(currentId, id)
				return Cf.val("<$tag $prop>$ss</$tag>")
			}
		}
		return;
	}
	classNode(name) {
		while(cur, object('map.classes')) {
			if(cur.cmp('name',name)) return cur;
		}
		return;
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
 
