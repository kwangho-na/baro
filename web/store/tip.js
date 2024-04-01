$.ajax({
			url,
			contentType: 'application/json',
			data: method=='GET'? param: JSON.stringify(param),
			type: method,
			dataType: type,
			cache: false,
  ...
})


loadPage(url, store, callback) {
		global=this
		const idx=global.pageIndex++;
		const name="page_"+idx
		global.apiCall('TEXT', url, res=>global.loadPageSource(name, res, store,callback))
},
