<widgets base="dev">
	<page id="p5" margin="0">
		<splitter id="panels" stretchFactor="content" stretch=1 type="hbox">
		</splitter>
	</page>
	<page id="treePanel">
		<tree id=tree>
		<hbox>
			<button id="ok" text="ok">
		</hbox>
	</page>
	<page id="content" margin=4> 
		<hbox margin=0>
			<label text="메뉴 : " height=24 align=right><input id=codeSearch width=85 height=24>
			<label text="메뉴명 : " height=24 align=right><input id=valueSearch width=85 height=24> 
			<label text="사용여부 : " height=24 align=right><combo id=useYn width=65 height=24> 
			<space>
			<button id=search text=조회 height=26>
		</hbox>
		<tree id=grid>
		<hbox margin=4>
			<button id="auth" text="권한적용">
			<check id=evalueCheck text="영문명 보기">
			<label id=subStatus stretch=1> 
			<button id=delete text=삭제 height=26>
			<button id=apply text=적용 height=26>
			<button id=addRow text=메뉴추가 height=26>
		</hbox>
	</page>
</widgets>

p=page('dev:p5')
p.open()

s=p.get('panels')
s.addPage(page('dev:treePanel'))
s.addPage(page('dev:content'))
