class layout {
	<page id="p1" margin="0" type="main" onInit() {
		this.put(sep, titleBar) 
		class(this, 'test_p1') 
		class(titleBar, 'test_titleBar')
		leftPanel=page('leftPanel')
		contentPanel=page('contentPanel')
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
		<context id="menuBar">
	</page>
	<page id="contentPanel">
		<div id="content">
	</page>
}


class test_p1 {
	initPage() {
		sep.addPage(leftPanel)
		sep.addPage(contentPanel)
		this.timer(200, this.setSepSize)
	}
	setSepSize() {
		total=arraySum(sep.sizes());
		if(total>600) {
			arr=arrayDivid("280,*",total);
		} else {
			arr=arrayDivid("3,7",total)
		}
		sep.sizes(arr); 
	}
}
class test_titleBar {
	onDraw(dc) {
		dc.fill('#fff')
	}
}
class test_leftMenu {
	// this == menu tree
}
class test_leftMenuBar {
	// this == menu button bars
	onDraw(dc) {
		dc.fill('#fff')
	}
}