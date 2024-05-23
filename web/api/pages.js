<api>
	 
	menuList(req, param, &uri) {
		param.parseJson(#[
			children:[
				{code:main, text:메인, url:"/api/pages/main"}
				{code:login, text:로그인, url:"/api/pages/login"}
				{code:list, text:리스트, url:"/api/pages/list"}
				{code:cards, text:카드, url:"/api/pages/cards"}
			]
		])
		return param;
	}
	footerMenuList(req, param, &uri) {
		param.parseJson(#[
			children:[
				{code:main, text:메인}
				{code:login, text:로그인}
				{code:list, text:리스트}
				{code:cards, text:카드}
			]
		])
		return param;
	}
	login(req, param, &uri) {
		req.send(fileRead('web/test/login.html'));
	}
	main(req, param, &uri) {
		req.send(fileRead('web/test/main.html'));
	}
	cards(req, param, &uri) {
		req.send(fileRead('web/test/cards.html'));
	}
	list(req, param, &uri) {
		req.send(fileRead('web/test/list.html'));
	}
	
</api>