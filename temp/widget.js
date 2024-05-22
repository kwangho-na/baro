class widget {	 
	addChild() {
		print("widget add child")
	}
	base() {
		base=this.var(baseCode)
		not(base ) base
		return when(base.find(':'), left(base,':'), base);
	}
	conf(name) {
		base=this.base()
		return conf("${base}.${name}")
	}
	getEventFunc(fnm) {
		fn=this.get(fnm) ty=typeof(fn)
		if(ty.eq('func')) {
			return when(fn.isPersist(), true, false);
		}
		src=#[
			${fnm}=event() {
				fn=Cf.funcNode()
				if(fn.eventFuncList()) {
					fn.callFuncSrc()
				}
			}
		]
		this[$src]
		fn=this.get(fnm)
		return when(fn.isPersist(), true, false);
	}
	setEvent(e,fc) {
		if(typeof(e,'string')) {
			fnm=e
			fn=this.getEventFunc(fnm)
			if(fn ) fn.addFuncSrc(fc)
		} else if(typeof(e,'node')) {
			for(fnm, e.keys()) { 
				if( this.isEventFunc(fnm) ) {
					fn.addFuncSrc(e.get(fnm))
				}
			}
		}
	}
}

 
class conf {
editorSrc: 
	<page id="${pageId}">
		<editor id="editor">
	</page>
}

class layout {
	<page id="main" margin="0" onInit() {
		this.put(sep, titleBar)
		class(this,'widget')
		class(this,'funcEditorMain')
		class(titleBar, 'funcEditorTitleBar')
		
	}>
		<context id="titleBar" height="40">
		<splitter id="sep">
	</page>
	
	<page id="leftPanel" onInit() {
		this.put(leftMenu, menuBar)
		class(leftMenu, 'test_leftMenu')
		class(menuBar, 'test_leftMenuBar')
	}>
		<tree id="leftMenu">
		<context id="menuBar">
	</page>
	<page id="contentPanel">
		<div id="content">
	</page>
}

class funcEditorMain {
	
	addEditor(pageId) {
		base=this.base()
		src=fmt(this.conf("editorSrc"))
		Cf.sourceApply(#[
			<widgets base="${base}">${src}</widgets>
		])
	}
	
}
class funcEditorTitleBar {
	onDraw(dc, rc) {
		dc.fill('#eee')
		dc.rectLine(rc.incrH(-1), 4, '#ccc', 2)
	}
}
