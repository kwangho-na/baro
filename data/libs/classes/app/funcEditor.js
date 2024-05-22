class conf {
editorSrc: 
	<page id="${pageId}">
		<editor id="editor">
	</page>
}

class layout {
	<page id="main" margin="0" onInit() {
		this.put(sep, titleBar)
		class(this,'page')
		class(this,'funcEditorMain')
		class(titleBar, 'funcEditorTitleBar')
		
	}>
		<context id="titleBar" height="40">
		<splitter id="sep">
	</page>
	
	<page id="leftPanel" onInit() {
		this.put(leftMenu, leftBar)
		class(leftMenu, 'funcEditorLeftMenu')
		class(leftBar, 'funcEditorLeftBar')
	}>
		<tree id="leftMenu">
		<context id="leftBar" height=30>
	</page>
	<page id="contentPanel" onInit() {
		this.put(content, contentBar)
		class(content, 'funcEditorContent')
		class(contentBar, 'funcEditorContentBar')
	}>
		<div id="content">
		<div id="contentBar" height=30>
	</page>
}

class funcEditorMain {
	leftPanel=page('leftPanel')
	contentPanel=page('contentPanel')
	sep.addPage(leftPanel)
	sep.addPage(contentPanel)
	
	this.timer(200, this.setSepSize)
	
	addEditor(pageId) {
		base=this.base()
		src=fmt(this.conf("editorSrc"))
		Cf.sourceApply(#[
			<widgets base="${base}">${src}</widgets>
		])
		return page(pageId)
	}
	setSepSize() {
		total=arraySum(sep.sizes());
		if(total>600) {
			arr=arrayDivid("225,*",total);
		} else {
			arr=arrayDivid("3,7",total)
		}
		sep.sizes(arr);
	}
}
class funcEditorTitleBar {
	onDraw(dc, rc) {
		dc.fill('#eee')
		dc.rectLine(rc.incrH(-1), 4, '#ccc', 2)
	}
}

class funcEditorLeftMenu {
	tree=this
	class(this, 'widget')
	this.setEvent(class('funcEditorTree'))
}
class funcEditorLeftBar {
	onDraw(dc, rc) {
		dc.fill('#eee')
		dc.rectLine(rc.incrH(-1), 4, '#ccc', 2)
		dc.text('funcEditorLeftBar','center')
	}
}
class funcEditorContent {
	tree=this
	
}
class funcEditorContentBar {
	onDraw(dc, rc) {
		dc.fill('#eee')
		dc.rectLine(rc.incrH(-1), 4, '#ccc', 2)
		dc.text('funcEditorLeftBar','center')
	}
}

class funcEditorTree {
	onMouseDown(p,a) {
		print("funcEditorTree mouse down", p,a)
	}
}