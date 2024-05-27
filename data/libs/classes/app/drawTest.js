class layout {
	<page id="main" margin="0" onInit() {class(this,'main',true)}>
		<context id="titleBar" height="40">
		<splitter id="sep">
	</page>
	<page id="canvasTest" onInit() {class(this, 'canvasTest', true)}>
		<canvas id="c">
	</page>

	<input id="filter">
		onKeyDown(k,a,b) {
			print("keydown ", k,a,b)
		}
	</input>
}

class main {
	initClass() {
		base=this.base()
		if(base) {
			apiClient.start(base)
			apiClient.setTarget(base, this)
		}
		@page.spacing(this, 2)
		print("=== func editor page init class ok ===", this)
	}
	onClose() {
		this.positionSave()
	}
}

class canvasTest {
	canvas=this.get('c')
	initClass() {
		input=widget('input','filter')
		input.flags('child')
		input.parentWidget(canvas)
		class(canvas,'widget')
		class(input,'widget')
		this.member(inputFilter, input)
		this.onResize()
		canvas.setEvent('onDraw', this.draw)
		input.setEvent('onKeyDown', this.keydown)
	}
	onResize() {
		rc=canvas.rect()
		rcInput=rc.rightBottom(120,30,-10,-10)
		inputFilter.move(rcInput)
	}
	draw(dc,rc) {
		print("canvas draw ", rc, this)
		dc.fill('#fff')
	}
	keydown() {
		args(k,a)
		if(k.eq(16777220, 16777221)) {
			val=this.value()
			if(val) {
				
			}
		}
	}
}