class func {
	page(name, funcNm, target) {
		not(name) {
			p=this.parentWidget()
			if(p) return p.pageNode();
			return this.pageNode();
		}
		if(name.eq('target')) {
			page=this.pageNode();
			return page.var(targetPage);
		}
		init=null;
		not(name.find(':')) {
			base=this.var(baseCode)
			if(base) {
				name=Cf.val(left(base,':'),':', name)
			} else {
				name=Cf.val('test:',name)
			}
		}
		page=Cf.getObject("page", name) 
		print("page name == $name created");
		not(page) return print("$name 페이지 생성오류");
		if(typeof(funcNm,'string')) {
			init=call(funcNm);
		} else if(typeof(funcNm,"function")) {
			init=funcNm;
		}
		if(typeof(init,"function")) {
			init(page);
			page.open();
		}
		if(typeof(target,'widget')) {
			page.var(targetPage,target);
		}
		return page;
	}
}

class Pages { 
	layout=class('Layout')
	maps=this.addNode('@pagesMap')
	addPage(page) {
		id=page.id
		if(id) {
			maps.set(id, page)
		}
		return page;
	}
	getPage(id) {
		return maps.get(id);
	}
	load(name, className) {
		page=layout.load(name)
		not(page) return print("page load error [$name 페이지 미정의]");
		if(className) class(page, className)
		return page;
	}
}
