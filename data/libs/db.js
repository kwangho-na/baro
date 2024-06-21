a='dsn	driver	server	dbnm	uid	pwd	port'
b='locknlock	SQL Server Native Client 11.0	100.1.2.85	SUXv4_SRM	locknlock	eJzKyU/OtjQ1No9PKS7KVQYI	1433'
@db.applyInsert(Baro.db('config'), 'db_info', a,b)


<func>
	@db.applyInsert(db, table, a,b) 	{
		aa=arrJoin(a.split("\t") )
		bb=arrJoin(b.split("\t"), "#str")
		sql="insert into $table ($aa) values($bb)"
		db.exec(sql)
	}
	arrJoin(a,sep) {
		not(sep) sep=','
		ss=''
		if(sep.ch('#')) {
			ty=sep.trim(1)
			while(c,a,n) {
				if(n) ss.add(',')
				switch(ty) {
				case str:			ss.add("'",c,"'")
				case bind:		ss.add("#{$c}")
				case lastDot: ss.add(right(c,'.'))
				default:
				}
			}
		} else {
			while(c,a,n) {
				if(n) ss.add(sep)
				ss.add(c)
			}
		}		
		return ss;
	}
	@test.load(pageId) { 
		base=@test.base()
		global("testGroupId", base )
		if( base.eq('test')) {
			filePath=@test.path("/test.js") 
		} else {
			filePath=@test.path("/${base}.js")
			not(isFile(filePath)) {
				filePath=@test.path("/test.js") 
			}
		}
		print("test load ==> file path : $filePath") 
		if(isFile(filePath)) {
			classSource(fileRead(filePath), base)
		} else {
			classLoadPath(testPath)
		}
		global('testLoad', true)
		not(pageId) pageId='main'
		return @test.layout(pageId);
	}
	@test.layout() {
		base=@test.base()
		switch(args().size()) {
		case 1:
			args(id)
			tag="page"
			global("testPageId", "$base:$id")
		case 2:
			args(tag,id)
		default:
		}
		print("test layout", base, tag, id)
		Cf.error(true)
		widget=Cf.getObject(tag, "$base:$id")
		if(widget) return widget;
		src=conf("layoutSource.${base}")
		not(src) return print("$base layout source 오류");
		Cf.sourceApply(#[
			<widgets base="${base}">${src}</widgets>
		]);
		widget=widget(tag, id, base);
		class(widget, id, base)
		err=Cf.error()
		if(err) {
			alert("테스트 레이아웃 생성오류 $err")
		}
		return widget;
	}
</func>


## mssql test
class conf {
	tableInfo: 
	<sql>
	  select a.name, a.crdate
	  FROM SYSOBJECTS A join SYSUSERS B on A.uid=B.uid and a.xtype='U'
	  where 1=1
		and a.name not like 'np_%'
	  order by A.name
	</sql>
	
	tableDetail: 
	<sql>
		SELECT D.COLORDER                	AS COLUMN_IDX            
			, A.NAME                    	AS TABLE_NAME            
			, C.VALUE                    	AS TABLE_DESCRIPTION
			, D.NAME                    	AS COLUMN_NAME
			, E.VALUE                    	AS COLUMN_DESCRIPTION
			, F.DATA_TYPE                	AS TYPE  
			, F.CHARACTER_OCTET_LENGTH    	AS LENGTH
			, F.IS_NULLABLE            		AS IS_NULLABLE
			, F.COLLATION_NAME            	AS COLLATION_NAME
		FROM SYSOBJECTS A  
		JOIN SYSCOLUMNS D        ON D.ID = A.ID
		JOIN INFORMATION_SCHEMA.COLUMNS F
			ON A.NAME = F.TABLE_NAME
			AND D.NAME = F.COLUMN_NAME
		LEFT OUTER JOIN SYS.EXTENDED_PROPERTIES C
			ON C.MAJOR_ID = A.ID
			AND C.MINOR_ID = 0
			AND C.NAME = 'MS_Description'
		LEFT OUTER JOIN SYS.EXTENDED_PROPERTIES E
			ON E.MAJOR_ID = D.ID
			AND E.MINOR_ID = D.COLID
			AND E.NAME = 'MS_Description'  
		WHERE 1=1
		AND A.TYPE = 'U'
		AND A.NAME = #{name} and A.uid ='1'
		ORDER BY D.COLORDER
	</sql>
}

class layout {
	<page id="main" title="락앤락 DB 관리툴" margin="0">
		<splitter type="hbox">
	</page>
	
	<page id="content" title="쿼리 조회페이지">
		<splitter type="vbox">
	</page>
}

class main {
	initClass() {
		@left=this.addWidget('canvas','leftPanel')
		@content=this.getWidget('content')
		@page.margin(content,4,0,8,0)
		this.positionLoad()
		class(left,'leftPanel')
		class(content,'contentPage')
		this.timer(500)
	}
	initPage() {
		splitter=findTag(this,'splitter')
		splitter.addPage(left)
		splitter.addPage(content)
		tot=splitter.sizes().sum()
		splitter.sizes(recalc(tot,'3,7'))
		splitter.stretchFactor(1)
		left.treeData()
		this.open()
	}
	onTimer() { 
		if( this.firstCall ) {
			this.initPage()
			this.firstCall=false
		}
		if( this.var(strEditQuery) ) { 			
			content.setQuery(this.var(strEditQuery))
			left.popup.hide()
			this.var(strEditQuery,null)
		}
	}
}

class popupTableInfo {
	initClass() {
		class(this,'form')
		this.addButtons(
			'AddField, MoveDown, MoveUp, MakeQuery, *, DeleteRow, NewTable', 
			'필드추가, 아래로, 위로, 선택 쿼리작성, *, 삭제, 새테이블 만들기', color('#8B3D53AA')
		)
		@grid=this.makeWidget('grid', 'gridTableInfo', 'rcGrid')		
		class(grid, 'grid')
		input=this.makeWidget('input', 'inlineInfoEditor')
		input.parentWidget(this)
		input.setEvent('onKeyDown', this, this.keydown)
		grid.setInput(input)
		grid.var(targetForm, this)
		grid.model(#[
			chk:선택						#40
			, COLUMN_NAME:컬럼명			#200
			, TYPE: 데이터타입			#100
			, COLUMN_DESCRIPTION: 설명	#200
			, IS_NULLABLE: NULL여부		#80
			, COLLATION_NAME: 키정보		#80
			, TABLE_DESCRIPTION:테이블정보	
		])
		grid.is('stretchLast', true)
		grid.var(bgColor, color('#528B3DE0'))
		grid.setEvent('onMouseDown', this, this.gridMouseDown)
		grid.setEvent('onMouseWheel', this, this.gridMouseWheel)
		this.updateButtons=null
		this.initFormCheck()
		this.timer(500)
	}
	onTimer() {
		if( grid.var(editStartTick)) {
			grid.var(editStartTick,0)
			grid.inputFocus()
		}
	}
	updateForm(rc) {
		vbox(rc, '*,32').inject(rcBody, rcStatus)
		rcGrid=rcBody.incr(2)
		btnInfo=this.getButtonWidth()
		arr=hbox(rcStatus.incrYH(4,2), btnInfo)
		while(btn, buttons, idx ) {
			not(btn.rectId) continue;
			btn.rectClient=arr.get(idx)
		}
		this.setFormRect()
		this.with(rcBody, rcStatus)
	}
	drawForm(dc, rc) {
		this.inject(rcBody, rcStatus)
		dc.fill(rcBody, '#fff')
		dc.fill(rcStatus, '#ccc')
		dc.rectLine(rc, 34, '#999', 2)
	}
	keydown(k,a,b) {
		if(k.eq(KEY.Escape)) {
			return grid.inputHide();
		}
		if(k.eq(KEY.Enter, KEY.Return, KEY.Tab)  ) {
			node=grid.var(editNode)
			if(node.flag(NODE.add)) {
				field=grid.var(currentEditField)
				fields=grid.fields()
				cur=findField(fields, 'field', field) idx=cur.index() + 1;
				next=fields.child(idx)
				grid.inputHide(true)
				if(next) {
					grid.edit(node, next.field)
				} else {
					grid.inputHide()
				}
			} else {
				next=grid.nextNode(node)
				grid.inputHide(true)
				if(next) grid.edit(next,'COLUMN_DESCRIPTION')
			}
		}
	}
	gridMouseWheel(delta) {
		grid.inputHide()
	}
	gridMouseDown(pos) {
		hh=grid.headerHeight()
		node=grid.at(pos.incrY(hh))
		not(node) {
			grid.inputHide()
			return; 
		}
		field=node.var(code)
		if(field.eq('chk')) {
			chk=when(node.flag(NODE.check), false, true)
			node.flag(NODE.check, chk)
			grid.update()
		} else if(field.eq('COLUMN_DESCRIPTION') ) {
			grid.edit(node, field)
		} else if(node.flag(NODE.add)) {
			grid.edit(node, field)
		}
	}
	drawGrid(dc,rc, node, field) { 
		if(field.eq('chk')) {
			if(node.flag(NODE.add)) {
				dc.fill(rc.incr(2),'#eaa')
			} else if(node.flag(NODE.modify)) {
				dc.fill(rc.incr(2),'#aae')
			}
			if(node.flag(NODE.check)) {				
				dc.image(rc.center(20,20), 'icons:check1')
			} else {
				dc.rectLine(rc.center(16,16), 0, '#888', 2)
			} 
		} else {
			dc.text(rc.incrX(2), node.get(field))
		}
	}
	setTable(node) {
		db=Baro.db('locknlock')
		root=grid.rootNode().removeAll()
		root.name=node.name
		db.fetchAll(this.conf("tableDetail"), root, true)
		this.title("테이블: ${node.name} 컬럼수: ${root.childCount()}")
		grid.update()
	}
	
	buttonClick(id) {
		fnm="click$id"
		fc=this.get(fnm)
		if(typeof(fc,'func')) call(fc, this)
	}
	clickAddField() {
		field=grid.fields().child(1).get('field')
		root=grid.rootNode()
		cur=root.addNode()
		cur.flag(NODE.add, true)
		grid.update()
		grid.current(cur)
		grid.edit(cur, field)
	}
	clickMoveDown() {
		cur=grid.current()
		next=grid.nextNode(cur)
		if(next) grid.current(next)
	}
	clickMoveUp() {
		cur=grid.current()
		prev=grid.prevNode(cur)
		if(prev) grid.current(prev)
	}
	clickMakeQuery() {
		root=grid.rootNode()
		table=root.name
		ss='', num=0
		while(cur, root) { 
			if(cur.flag(NODE.check) ) { 
				if(ss) ss.add(', ')
				ss.add(cur.column_name)
				num++;
			}
		}
		not(num) {
			return this.alert('선택된 필드정보가 없습니다')
		} 
		sql=#[
			SELECT
				${ss}
			FROM
				${table}
			WHERE 1=1
		];
		page('main').var(strEditQuery, sql)
	}
}

class leftPanel {
	initClass() {
		class(this,'tree')
		class(this,'form')
		@db=Baro.db('locknlock')
		@tree=this.makeWidget('tree','tableTree','rcTree')
		@popup=this.makeWidget('canvas','popupTableInfo') class(popup, 'popupTableInfo', true)
		tree.setEvent('onDraw', this, this.treeDraw)
		tree.setEvent('onMouseDown', this, this.treeMouseDown)
		tree.setEvent('onMouseMove', this, this.treeMouseMove)
		tree.setEvent('onFilter', this, this.treeFilter)
		tree.var(treeMode, false)
		tree.model('name')
		@input=this.makeWidget('input','inputFilter','rcInput')
		input.setEvent('onTextChange', this, this.inputFilterChange)
		this.initFormCheck()
		this.timer(500)
	}
	onTimer() { 
		if( this.var(filterChangeTick)) {
			dist=System.tick() - this.var(filterChangeTick);
			if(dist>250) {
				this.var(filterChangeTick,0)
				tree.update()
			}
		}
	}
	inputFilterChange() {
		this.var(filterChangeTick, System.tick())
	}
	updateForm(rc) {
		vbox(rc,'30,*,34').inject(rcTitle, rcBody, rcStatus)
		hbox(rcStatus.incr(4), '180,*').inject(rcInput, rcSpace)
		rcTree=rcBody.incr(2)
		this.with(rcTitle, rcBody, rcStatus)
		this.setFormRect()
	}
	drawForm(dc, rc) {
		this.inject(rcTitle, rcBody, rcStatus)
		dc.fill('#aaa')
		dc.fill(rcTitle.incr(1), '#ddd')
		dc.fill(rcStatus.incr(1), '#ddd')
	}
	popupTableInfo(node) {
		rc=tree.nodeRect(node)
		rcPopup=rc(rc.rb(),900,450)
		rcGlobal=tree.mapGlobal(rcPopup)
		popup.move(rcGlobal)
		popup.open()
		popup.active()
		popup.setTable(node)
	}
	treeDraw(dc, node, index, state, over) { 
		rc=this.drawSelect(dc, dc.rect(), node, col, state, over)
		node.rcIcon=rc.moveLeft(18,18,-2,0,true) 
		node.inject(name, comment)
		btnIcon='vicon:database_table'
		dc.font(10).pen('#223').text(rc, name)
		dc.textSize(name).inject(tw, th)
		dist=rc.width() - tw;
		if(dist.gt(60)) {
			tw+=4;
			rcIcon=rc.incrX(tw).leftCenter(20,20) 
			dc.rectLine(rcIcon,0,'#eee')
			dc.image(rcIcon.center(18,18), btnIcon)
			node.rcBtn=rcIcon
			if(comment) {
				tw+=20;
				rcComment=rc.incrXW(tw, 4) 
				dc.font(9).pen('#966').text(rcComment, "- $comment", "right")
			}
		}
	}
	treeData() {
		root=tree.rootNode()
		db.fetchAll(this.conf('tableInfo'), root)
		while(cur, root) {
			cur.comment=conf("tableComment.${cur.name}")
		}
		tree.update()
	}
	treeMouseMove(pos) {
		node=tree.at(pos)
		if(node ) {
			node.inject(rcBtn, rcCopy)
			if(rcBtn.contains(pos) ) {
				this.rcOver=node.rcBtn
				this.cursor(CURSOR.PointingHandCursor)
				return
			}
		}
		if( this.rcOver) {
			this.rcOver=null
			this.cursor(0)
		}
	}
	treeMouseDown(pos,key,btn) { 
		node=tree.at(pos)
		not(node) return;
		node.inject(rcIcon, rcBtn)
		if(rcIcon.contains(pos)) return;
		if( this.rcOver ) {
			if( rcBtn.contains(pos) ) {
				this.popupTableInfo(node)
				return 'ignore'
			}
		}
		rc=tree.nodeRect(node)
		if(this.currentTreeNode!=node) {
			this.currentTreeNode=node
			tree.current(node)
			tree.expand(node, true, true)
			page('main').var(currentTreeNode, node)
		}
		return 'ignore';
	}
	treeFilter(node) {
		text=input.value()
		not(text) return true;
		if(node.get('name').find(text)) return true;
		return false;
	}
}

class contentPage {
	initClass() {
		splitter=findTag(this,'splitter')
		@editor=this.makeWidget('editor','editorMssql')
		@form=this.makeWidget('canvas', 'contentForm')
		class(editor,'editorSql')
		class(form,'contentForm')
		splitter.addPage(editor)
		splitter.addPage(form)
		tot=splitter.sizes().sum()
		splitter.sizes(recalc(tot,'*,34'))
		splitter.stretchFactor(0)
	}
	setQuery(query) {
		db=Baro.db('locknlock')
		grid=form.grid
		editor.insertQuery(query)
		splitter=findTag(this,'splitter')
		hh=splitter.sizes().get(1)
		if(hh<100) {
			tot=splitter.sizes().sum()
			splitter.sizes(recalc(tot,'*,300'))
		} 
		root=grid.rootNode().removeAll()
		db.fetchAll(query, root, true)
		ss='', num=0
		while(field,root.var(fields), num) {
			if(num) ss.add(',')
			ss.add(field)
		}
		grid.fields(ss)
		if( num<10 ) {
			grid.size().inject(width)
			arr=recalc(width,num)
			grid.headerWidth(arr)
		} else {
			arr=_arr()
			while(n=0, num) {
				arr.add(100)
			}
			grid.headerWidth(arr)
		}
		grid.update()
	}
}

class contentForm {
	initClass() {
		class(this, 'form') 
		@grid=this.makeWidget('grid', 'gridDetail', 'rcGrid')
		this.initFormCheck()
	}
	updateForm(rc) {
		vbox(rc,'*,34').inject(rcBody, rcStatus)
		if( rcBody.height()>100) {
			rcGrid=rcBody.incr(2)
		} 
		this.with(rcBody, rcStatus) 
		this.setFormRect()
	}
	drawForm(dc, rc) {
		this.inject(rcTitle, rcBody, rcStatus)
		dc.fill('#fff') 
		dc.fill(rcStatus.incr(1), '#888') 
	}
}

class func {
	tableCommentQuery(root) {
		ss=''
		while(cur,root, n) {
			if(n) ss.add("\n")
			ss.add("SELECT objname as table, value FROM ::fn_listextendedproperty (NULL, 'schema', 'dbo', 'table', '${cur.name}', default, default)")
		}
		return ss;
	}
}
