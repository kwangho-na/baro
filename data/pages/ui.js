@ui.boxRect(vbox, rect, &info, result ) {
	base=null;
	not( typeof(rect,"rect") ) return print("[boxRect] 영역 오류");
	if( margin ) rect.margin( margin);
	not( gap ) gap=0;
	rect.inject( x,y,w,h);
	arr=_arr()
	if( typeof(info,"num") ) {
		num=info.toInt();
		if(vbox) arr.div(num, h, y) else  arr.div(num, w, x);
	} else {
		not( info ) return print("[boxRect] 영역정보 오류");
		if( vbox) arr.div(info, h, y) else  arr.div(info, w, x);
	}
	num=arr.size()-1;
	last=num-1;
	not(result) result=_arr();
	while( n=0, n<num, n++ ) {
		if( vbox ) {
			y=arr.get(n);
			h=arr.dist(n,1);
		} else {
			x=arr.get(n);
			w=arr.dist(n,1);
		}
		result.add(rc(x,y,w,h))
	}
	return result;
}
vbox(rect, &info, result ) {
	return @ui.boxRect(true, rect, info, result );
}
hbox(rect, &info, gap) {
	return @ui.boxRect(false, rect, info, result );
}
