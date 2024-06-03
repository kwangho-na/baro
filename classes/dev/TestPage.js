class layout {
	<splitter id="main_splitter">
	<splitter>
	
	<div id="leftPanel">
	</div>
	 
	<div id="contentPanel">
	</div>
	
	<div id="optionsPanel">
	</div>
	 
}

class TestPageCanvas { 
	initClass() {
		@page=page()
		@ranges=this.dataNode('ranges')
		@splitter=this.getWidget('main_splitter')
		this.timer(50, this.initPage)
	}
	initPage() {
		page.positionLoad(800, 600)
		tot=splitter.sizes().sum() 
		splitter.sizes(this.dataArray().recalc(tot, "30,*,20"))
	}
}

 
