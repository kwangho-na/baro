class conf {	
editor:
	<page id="${id}" margin=2 spacing=0 onInit() {
		this.put(editor,buttonsBar)
		class(editor, "funcEditor")
		class(buttonsBar, "funcEditorButtonBar")
	}>
		<editor id="editor">
		<hbox spacing=0>
			<context id="buttonsBar" height=20>
		</hbox>
	</page>
}

class layout {
	<page id="main" margin="0" type="main" onInit() {
		this.put(sep, titleBar) 
		leftPanel=page('leftPanel')
		contentPanel=page('contentPanel')
		class(this, 'funcEditorPage') 
		class(titleBar, 'funcEditorTitleBar')
		sep.addPage(leftPanel)
		sep.addPage(contentPanel)
		this.timer(200, this.setSepSize)
		this.initPage()
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
		<context id="menuBar" height=30>
	</page>
	<page id="contentPanel">
		<tab id="tabs">
	</page>
}

class funcEditorPage {  
	initPage() {
		print("funcEditorPage init ", this.member())
	}
	onClose() {
		this.hide();
		this.setPagePostion()
		return when(closeMode.eq('quit'),'close','ignore')
	}
	setPagePosition() {
		geo=Cf.jsValue(this.geo()) 
		conf("funcEditorPage.pagePostion","closePosition:$geo", true) 
	} 
	quit() { 
		this.member(closeMode, "quit")
		this.close();
	} 
}
class funcEditorTitleBar {
	onDraw(dc, rc) {
		dc.fill('#fff')
	} 
}

class funcEditor {
	print("funcEditor onInit")
}
class funcEditorButtonBar { 
	print("funcEditorButtonBar onInit")
}

