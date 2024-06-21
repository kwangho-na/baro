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
</func>


## mssql test
class conf {
	tableInfo: <sql>
	  select a.name, a.crdate
	  FROM SYSOBJECTS A join SYSUSERS B on A.uid=B.uid and a.xtype='U'
	  where 1=1
		and a.name not like 'np_%'
	  order by A.name
	</sql>
	tableDetail: <sql>
		SELECT D.COLORDER                	AS COLUMN_IDX            -- Column Index
			, A.NAME                    	AS TABLE_NAME            -- Table Name
			, C.VALUE                    	AS TABLE_DESCRIPTION    -- Table Description
			, D.NAME                    	AS COLUMN_NAME            -- Column Name
			, E.VALUE                    	AS COLUMN_DESCRIPTION    -- Column Description
			, F.DATA_TYPE                	AS TYPE                    -- Column Type
			, F.CHARACTER_OCTET_LENGTH    	AS LENGTH                -- Column Length
			, F.IS_NULLABLE            		AS IS_NULLABLE            -- Column Nullable
			, F.COLLATION_NAME            	AS COLLATION_NAME        -- Column Collaction Name
		FROM SYSOBJECTS A WITH (NOLOCK)  
		JOIN SYSCOLUMNS D WITH (NOLOCK)        ON D.ID = A.ID
		JOIN INFORMATION_SCHEMA.COLUMNS F WITH (NOLOCK)
			ON A.NAME = F.TABLE_NAME
			AND D.NAME = F.COLUMN_NAME
		LEFT OUTER JOIN SYS.EXTENDED_PROPERTIES C WITH (NOLOCK)
			ON C.MAJOR_ID = A.ID
			AND C.MINOR_ID = 0
			AND C.NAME = 'MS_Description'
		LEFT OUTER JOIN SYS.EXTENDED_PROPERTIES E WITH (NOLOCK)
			ON E.MAJOR_ID = D.ID
			AND E.MINOR_ID = D.COLID
			AND E.NAME = 'MS_Description'  
		WHERE 1=1
		AND A.TYPE = 'U'
		AND A.NAME = #{name} and A.uid ='1'
		ORDER BY D.COLORDER
	</sql>
}
class func {
	tableCommentQuery(root) {
		ss=''
		while(c,root, n) {
			if(n) ss.add("\n")
			ss.add("SELECT objname as table, value FROM ::fn_listextendedproperty (NULL, 'schema', 'dbo', 'table', 'np_act_info', default, default)"
		}
		return ss;
	}
}

class layout {
	<page id="main" title="메인 페이지">
		<splitter type="hbox">
	</page>
	<page id="content" title="내용페이지">
		<splitter type="vbox">
	</page>
}

class main {
	initClass() {
		splitter=findTag(this,'splitter')
		@left=this.addWidget('canvas','leftPanel')
		@content=this.getWidget('content')
		this.positionLoad()
		splitter.addPage(left)
		splitter.addPage(content)
		tot=splitter.sizes().sum()
		splitter.sizes(recalc(tot,'3,7'))
		splitter.stretchFactor(1)
		class(left,'leftPanel')
		class(content,'contentPage')
	}
}

class leftPanel {
	initClass() {
		class(this,'tree')
		@db=Baro.db('locknlock')
		@tree=this.makeWidget('tree','tableTree','rcTree')
		tree.model('name')
		this.initFormCheck()
	}
	updateForm(rc) {
		vbox(rc,'30,*,34').inject(rcTitle, rcBody, rcStatus)
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
	treeDraw(dc, node, index, state, over) { 
		rc=this.drawSelect(dc, dc.rect(), node, col, state, over)
		node.rcIcon=rc.moveLeft(18,18,-2,0,true) 
		node.inject(name, comment)
		dc.font(11, color('#445'))
		btnIcon='vicon:database_table'
		dc.textSize(name).inject(tw, th)
		dist=rc.width() - tw;
		dc.text(rc, name)
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
}

class contentForm & form {
	initClass() {
		@grid=this.makeWidget('grid', 'gridDetail', 'rcGrid')
		this.initFormCheck()
	}
	updateForm(rc) {
		vbox(rc,'30,*,34').inject(rcTitle, rcBody, rcStatus)
		if( rcBody.height()>100) {
			rcTree=rcBody.incr(2)			
		}
		this.setFormRect()
	}
	drawForm(dc, rc) {
		dc.fill('#fff')
		rectLine(rcTitle, 4, '#888')
		rectLine(rcStatus, 2, '#888')
	}
}


@test.page(tag) {
		not(tag) tag="canvas"
		idx=global().incrNum('testPageIndex')
		pageId="testPage_$idx"
		base=global("testBaseId")
		not(base) base="test"
		Cf.sourceApply(#[
			<widgets base="${base}">
				<page id="${pageId}">
					<${tag} id="${tag}">
				</page>
			</widgets>
		]);
		return page("test:$pageId")
	}
	
