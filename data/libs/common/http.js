<func>
@http.procSave(type, &data) {
	print(">> $type", data.size())
	switch(type) {
	case read:		this.appendText('@result',data);
	case finish: 	@http.procSave('result', this.var(result));
	case result:
		name=this.saveFile;
		not(name) {
			uri=@http.fileName(this.url);
			if(uri.find('.')) uri=leftVal(uri,'.');
			date=System.date('yyyyMMdd_hhmmss');
			name="data/download/${uri}-${data}.html";
		}
		fileWrite(name, data);
	default:
	}
}
@http.fileName(&s) {
	name=s.findPos("?");
	return name.findLast("/").right().trim();
}
</func>
