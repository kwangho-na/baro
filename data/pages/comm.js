<widgets base="comm">
	<page id="prompt1">
		<form>
			<row>
				<label text="이름" id="name">
				<input id="value">
			</row>
		</form>
		<hbox>
			<space>
			<button id="ok" text="확인" onClick() {
				p=page()
				val=p.get('value').value()
				if(p.callback) p.callback(val)
			}>
			<button id="cancel" text="취소" onClick() {
				page().close()
			}>
		</hbox>
	</page>
</widgets>
