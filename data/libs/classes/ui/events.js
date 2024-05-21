class eventCall {
	onMouseDown(p,a) {
		not(this.member(events)) return;
		while(e,events) {
			fc=e.onMouseDown
			if(typeof(fc,'function')) fc(p,a)
		}
	}
	onMouseUp(p,a) {
		not(this.member(events)) return;
		while(e,events) {
			fc=e.onMouseUp
			if(typeof(fc,'function')) fc(p,a)
		}
	}
	onMouseMove(p,a) {
		not(this.member(events)) return;
		while(e,events) {
			fc=e.onMouseMove
			if(typeof(fc,'function')) fc(p,a)
		}
	}
	onDraw(dc, rc) {
		
	}
	setEvent(e) {
		if(typeof(e,'string')) {
			e=class(e)
		}
		not(typeof(e,'node')) return print("setEvent 매개변수 오류");
		not(this.member(events)) {
			this.member(events, this.addArray('@events'))
		}
		events.add(e)
	}
}

class eventScroll {
	onMouseDown(p,a) {
		if(a.eq(KEY.ctrl) ) {
			not(this.mouseDownTick) {
				p.inject(px, py)
				this.member(mx,px)
				this.member(my,py)
				print("mouse down ", px, py)
				this.mouseDownTick=System.tick()
				return
			}
		}
	}
	onMouseUp(p,a) {
		this.mouseDownTick=0;
		print("mouse up", this.mouseDownTick)
	}
	onMouseMove(p,a) {	
		if(this.mouseDownTick ) {
			p.inject(px, py)
			this.member(sx, mx-px)
			this.member(sy, my-py)
			this.redraw()
		}
	}
}
