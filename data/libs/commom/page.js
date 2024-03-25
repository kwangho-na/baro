<func note="프로그램 공통 기능구현">
	@app.watcherPageImpl() {
		path=System.path();
		watche=System.watcherFile('pageImpl', func() {
			args(act, name)
			n=this.get(name)
			if(n>0) {
				dist=System.tick()-n
				if(dist<500) return;
			}
			this.set(name, System.tick());
			if(act==1) {
				print("$name 파일 생성 웹페이지맵 새로고침")
			} else {
				print("파일변경 $act $name");
			}
			@app.pageImplChange(act, name)
		})
		conf=watche.config()
		not(conf.target ) {
			watche.start("$path/pages/impl")
		}
	}
	
	@app.pageImplChange(act,name) {
		if(act==2) {
			print("$name 파일 삭제")
			return;	
		}
		print(this, name)
		parse(name)
		parse=func(&s) {
			obj=null
			a=s.move()
			c=s.ch()
			if(c.eq('#')) {
				b=s.incr().move()
				page=Cf.getObject("page","$a:$b")
				if(s.ch('.')) {
					d=s.incr().move()
					obj=page.get(d)
				} else {
					obj=page
				}
			} else if(c.eq('.')) {
				b=s.incr().move()
				if(s.ch('#')) {
					d=s.incr().move()
				}
				obj=Cf.getObject(a,"$b:$d")
			}
			if(obj) {
				path=this.target
				src=fileRead("$path/$name")
				if(src) obj[$src]
			}
		};
	}
</func>
