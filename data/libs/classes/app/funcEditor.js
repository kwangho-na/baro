class conf {
editorSrc: 
	<page id="#{0}"><editor id="editor"></page>
}

class layout {
	<page id="main" margin="0" onInit() {
		this.put(sep, titleBar)
		leftPanel=page('leftPanel')
		contentPanel=page('contentPanel')
		sep.addPage(leftPanel)
		sep.addPage(contentPanel)
		apiClient=class('ProxyClient')
		apiSocket=socket=apiClient.start('funcEditor')
		class(this,'main', true)
		class(leftPanel,'leftPanel', true)
		class(contentPanel,'contentPanel', true)
		class(titleBar, 'titleBar', true)
		this.timer(200, this.setSepSize)		
	}>
		<context id="titleBar" height="40">
		<splitter id="sep">
	</page>
	
	<page id="leftPanel">
		<tab id="leftTab">
		<context id="leftBar" height=30>
	</page>
	<page id="funcTree"><tree id="tree"></page>
	<page id="workTree"><tree id="tree"></page>
	
	<page id="contentPanel">
		<div id="content">
		<div id="contentBar" height=30>
	</page>
}

class main {
	initClass() {
		print("=== func editor page init class ok ===", this)
	}
	addEditor(pageId) {
		base=this.base()
		src=fmt(this.conf("editorSrc"))
		Cf.sourceApply(#[
			<widgets base="${base}">${src}</widgets>
		])
		contentPanel.addPage(page(pageId))
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
	apiCall(uri) {
		
	}
	apiResult(socket, uri, data, param) {
		
	}
}
class titleBar {
	onDraw(dc, rc) {
		dc.fill('#eee')
		dc.rectLine(rc.incrH(-1), 4, '#ccc', 2)
	}
}
class leftPanel {
	this.put(leftTab, leftBar)
	funcTree=page('funcTree')
	workTree=page('workTree')
	initClass() {
		tab=leftTag.tab;
		tab.addPage(funcTree,'함수정보')
		tab.addPage(workTree,'작업정보')
		tab.current(0)
		funcLoad
	}
}
class contentPanel {
	this.put(content, contentBar)
	class(content, 'content', true)
	class(contentBar, 'contentBar', true)
	initClass() {
		pageId="contentDefaultEditor"
		page=this.makePage("editorSrc",pageId)
		content.addPage(page, true)
		print("contentPanel init class default page ==>", page)
	}
}


class leftTab {
	this.put(tree)
	class(this, 'widget')
	initClass() {
		funcTree.setTreeData()
		workTree.setTreeData()
	}
}
class leftBar {
	onDraw(dc, rc) {
		dc.fill('#eee')
		dc.rectLine(rc.incrH(-1), 4, '#ccc', 2)
		dc.text('funcEditor leftBar','center')
	}
}
class content {
	addPage(page) {
		content.addPage(page)
	}
}
class contentBar {
	onDraw(dc, rc) {
		dc.fill('#eee')
		dc.rectLine(rc.incrH(-1), 4, '#ccc', 2)
		dc.text('funcEditor contentBar','center')
	}
}

class funcTree {
	tree=this
	onMouseDown(p,a) {
		print("funcEditorTree mouse down", p,a)
	}
	setTreeData() {
		
	}
}
class workTree {	 
	tree=this
	setTreeData() {
		
		
	}
}