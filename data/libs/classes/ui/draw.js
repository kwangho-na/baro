class func { 
	@draw.rectArray(rc,cx,cy,iw,ih,num) {
		arr=[]
		rc.inject(x,y,w,h)
		th=ih*num
		gap=h - th;
		gap/=3;
		if(gap>0 ) {
			while(n=0, num) {
				rcImg=rc(cx, cy, iw, ih)
				cy+=ih;
				cy+=gap;
				arr.add(rcImg)
			}
		}
		return arr;
	}
}
