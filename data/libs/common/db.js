<func note="sqlite">
	@db.tableCheck(db, name) {
		return db.fetch("select name from sqlite_master where name='${name}'")
	}
	@db.execQuery(db, &sql) {
		while(sql.valid()) {
			query=sql.findPos(';')
			db.exec(query)
			not(sql.ch()) break;
		}
	}
</func>
