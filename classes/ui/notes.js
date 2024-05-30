class conf {
notePage:
	<page id="${id}" margin=2 spacing=0 onInit() {
		this.flags('frameless', true)
		class(this, "notePage")
	}>
		<editor id="e">
		<hbox spacing=0>
			<canvas id="c" height=20>
		</hbox>
	</page>
} 
class notePage { 
	closeMode=''
	pageListArray=object('note.pages').addArray("pageListArray")
	this.notePageMove(this.lastPage())
	pageListArray.add(this)
	
	onClose() {
		this.hide();
		this.setPagePostion()
		return when(closeMode.eq('quit'),'close','ignore')
	}
	
	setPagePosition() {
		page=this 
		start=pageListArray.get(0)
		if(page==start) {
			val=Cf.val('closePosition:',Cf.jsValue(page.geo()));
			conf("note.pagePostion",val, true)
		}
	}
	lastPage() {
		last=pageListArray.size()-1
		return pageListArray.get(last) 
	}
	noteCommand(param) {
		
	}
	positionCheck(rc) {
		not( inPos(rc.lt()) ) return 'lt';
		not( inPos(rc.rt()) ) return 'rt';
		not( inPos(rc.lb()) ) return 'lb';
		not( inPos(rc.rb()) ) return 'rb';
		return 'ok';
		
		inPos = func(p) {
			cnt=System.info('screenCount')
			while(n=0, n<cnt, n++) {
				rcScreen=System.info('screenRect', n)
				not(rcScreen.contains(p)) return false;
			}
			return true;
		};
	}
	pageCloseAll() {
		while(p, pageListArray) {
			p.member("closeMode", "quit")
			p.close();
		}
	}
	notePageMove(prev) {
		rcMove=null;
		if(prev) {
			rc=prev.geo();
			rcMove=rc.moveBottom(0,150,0,2)
			chk=this.positionCheck(rcMove)
			not(chk.eq('ok')) {
				print("page move not contain rect ", chk, rcMove)
				pa=minY()
				rc=pa.geo()
				if(rc.x()>1000 ) {
					rcMove=rc.moveLeft(0,0,1,0)
				} else {
					rcMove=rc.moveRight(0,0,1,0)
				} 
			}
		} else {
			s=conf("note.pagePostion")
			rc=closePositionRect(s)
			if(typeof(rc,'rect')) {
				rcMove=rc;
			}
			not(rcMove) {
				rc=rc(System.info('screenRect',0));
				rcMove=rc.rightTop(200,150)
			}
		}
		
		if(rcMove) {
			this.move(rcMove)
		}
		closePositionRect = func(&s) {
			not(s) return;
			s.findPos('closePosition:')
			s.findPos('<')
			ss=s.findPos('>')
			ss.split(',').inject(x,y,w,h)
			return rc(x,y,w,h)
		};
		minY = func() {
			b=5000;
			while(p, pages.notePageList) {
				a=p.geo().y()
				if(a<b) b=a;
			}
			while(p, pages.notePageList) {
				a=p.geo().y()
				if(a==b) return p;
			}
			return;
		};
		minX = func() {
			b=5000;
			while(p, pages.notePageList) {
				a=p.geo().x()
				if(a<b) b=a;
			}
			while(p, pages.notePageList) {
				a=p.geo().x()
				if(a==b) return p;
			}
			return;
		};
	}
}
class noteCanvas {
	onDraw(dc, rc) {
		not(this.bg) this.bg=randomColor().lightColor(50)
		dc.fill(this.bg)
		rcIcon=rc.width(24).center(18,18)
		dc.image(rcIcon, 'c:/temp/test.png')
	}
	onMouseDown(pt) {
		this.mouseTick=System.tick()
		page=this.page;
		page.geo().inject(gx, gy)
		this.mapGlobal(pt).inject(x,y)
		this.gx=gx;
		this.gy=gy;
		this.mx=x
		this.my=y
	}
	onMouseUp(pt) {
		this.mouseTick=0
	}
	onMouseMove(pt) {
		not(this.mouseTick) return;
		this.mapGlobal(pt).inject(x,y)
		page=this.page;
		dx=this[mx-x], dy=this[my-y];
		this.mx=x
		this.my=y
		this[gx-=dx], this[gy-=dy]
		if(this.gy<0) this.gy=0
		page.move(this.gx, this.gy)
	}
}