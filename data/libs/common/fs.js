<func note="파일시스템 함수모음">
	@fs.getChildCount(path, type) {
		not(isFolder(path)) return 0
		fo=Baro.file("fs");
		fo.var(filter,null)
		not(type) {
			type=='folder'
			fo.var(filter,'folders')
		} 
		cnt=0;
		fo.list(path,func(info) {
			while(info.next()) {
				info.inject(type, name)
				if(name.eq('.','..')) continue
				cnt.incr()
			}
		})
		return cnt;
	}
</func>
