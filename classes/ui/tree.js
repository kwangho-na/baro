class tree {	 
	tree=this
	drawTree(dc, node ) {
		rc = dc.rect().incrX(-20);
		dc.fill();
		rcIcon = drawTreeIcon(dc,rc,node);
		r = rc.move(rcIcon.rt()).width(16); 
		switch( node[depth]) {
		case 0:
			dc.image( r.center(14,14), node[icon] );
			dc.text( rc.move(r.rt()), node[value] );
		case 1:
			dc.image( r.center(14,14), 'vicon.folder_database' );
			dc.text( rc.move(r.rt()), node[value] );
		case 2:
			dc.image( r.center(14,14), 'vicon.database_table' );
			dc.text( rc.move(r.rt()), node[value] );
		default:
			dc.text( rc.move(rcIcon.rt()), node[value] );
		} 
		if( node.icon ) {
			dc.image( rc.move('end',32).center(16,16), $node[icon]);
		}
	}
	drawTreeIcon(dc, rc, node) {
		if( dc.state(STYLE.Selected) ) {
			dc.fill( rc.x(0,true), '#f0f0f0' );
		} else {
			dc.fill( rc.x(0,true), '#ffffff' );
		}
		rcIcon = rc.width(18); 
		if( node.childCount() ) {
			if( dc.state(STYLE.Open) ) {
				dc.image( rcIcon.center(14,16).incrY(2), 'tree:plus' );
			} else {
				dc.image( rcIcon.center(14,16).incrY(2), 'tree:minus' );			
			}
		} else if( node[depth]<depth ) {
			dc.image( rcIcon.center(14,16).incrY(2), 'vicon.bullet_black' );			
		}
		return rcIcon;

	}
}
 
 