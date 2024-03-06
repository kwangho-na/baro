<api>
	query(req, param, &uri) {
		dsn=param.dsn not(dsn) dsn='config'
		sql=param.sql.escape()
		db=Baro.db(dsn)
		db.fetchAll(sql,param, true)
		ss=''
		print("param=>", param) 
		while(field, param.var(fields), idx ) {
			if(idx) ss.add("\t")
			ss.add(field);
		}
		while(cur, param, idx ) {
			ss.add("\n")
			while(field, param.var(fields), idx ) {
				if(idx) ss.add("\t")
				ss.add(cur.get(field));
			}
		}
		return ss;
	}
	saveNote(req, param, &uri) {
		src=param.src.escape()
		name=param.name;
		not(name) param.error="노트명을 입력하세요"
		conf("note#xx.$name",src, true)
		param.src="note#xx.$name";
		return param;
	}
	confValue(req, param, &uri) { 
		return @util.confValue(uri.trim());
	}
	testSrcValue(req, param, &uri) { 
		code=uri.trim()
		return @util.confValue("test#src.$code");
	}
	testSrcList(req, param, &uri) { 
		Baro.db('config').fetchAll("select cd as name, tm, regdt from conf_info where grp='test#src' and data!=''", param)
		return param;
	}
	templateList(req, param, &uri) {
		db=Baro.db('config')
		db.fetchAll("select cd from conf_info where grp like 'xtemplate%'", param)
		return param;
	}
	treedata(req,param,&uri) {
		name=uri.trim();
		src=conf("treedata.$name")
		@data.makeTree(param, src)
		param.type='root';
		return param;
	}  
</api>
