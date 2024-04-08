<widgets base="dev">
	<page id="p5" margin="0">
		<splitter id="panels" stretchFactor="content" stretch=1 type="hbox">
		</splitter>
	</page>
	<page id="treePanel">
		<tree id=tree>
		<hbox>
			<button id="ok" text="ok">
		</hbox>
	</page>
	<page id="content" margin=4> 
		<hbox margin=0>
			<label text="메뉴 : " height=24 align=right><input id=codeSearch width=85 height=24>
			<label text="메뉴명 : " height=24 align=right><input id=valueSearch width=85 height=24> 
			<label text="사용여부 : " height=24 align=right><combo id=useYn width=65 height=24> 
			<space>
			<button id=search text=조회 height=26>
		</hbox>
		<tree id=grid>
		<hbox margin=4>
			<button id="auth" text="권한적용">
			<check id=evalueCheck text="영문명 보기">
			<label id=subStatus stretch=1> 
			<button id=delete text=삭제 height=26>
			<button id=apply text=적용 height=26>
			<button id=addRow text=메뉴추가 height=26>
		</hbox>
	</page>
</widgets>

p=page('dev:p5')
p.open()

s=p.get('panels')
s.addPage(page('dev:treePanel'))
s.addPage(page('dev:content'))

~~ actions
node=object("app.actions")
node.parseJson(#[
	[
		{id: 'func.addFunc',	text: 함수추가,		icon:icons/application_edit.png },
		{id: 'func.reload',	text: 새로고침,		icon:icons/arrow_rotate_clockwise.png },
		{id: 'func.deleteFunc',	text: 함수삭제,		icon:icons/vicon.delete_default.png },
	]
])
p.action(node.var(array))
p[
	onContextMenu(pos) {
		print("context pos==$pos")
		this.menu('func.addFunc, func.reload, -, func.deleteFunc', pos.incrY(4) );
	} 
	onAction(act) {
		id=act.id
		print("action ", id)
	}
]	
~~
search(node) {
	this[maxCode]= null;
	root = this[grid].rootNode();
	root.initNode(node);
	root[useyn] = this[useYn].value();
	not( root[code] ) 
		return;
	db.fetchAll(sql,  root);
	this[grid].update();
	this[grid].selectClear();
	this[apply].hide();
	this[delete].hide();
	this[subStatus].value("전체 : $root.size() 건");
}
search.onClick() {
	this.search( this[tree].current() );
}

tree.onChildData() {
	not( @node.parent() ) {
		cur = @node.addNode({value: 메뉴관리, icon: vicon.overlays_default, code: 'ROOT', depth: 0});
		return;
	} 
	@lastLoad = System.tick();
	db.fetchAll("select icon, code, pcode, depth, value from comm_tree where ref='MP' and pcode=#{code} order by sort, seq", @node );
}

tree.onDraw() {	
	 this.drawTree(@draw, @node);
}

drawTree(d, node ) {
	rc = d.rect().incrX(-20);
	d.fill();
	rcIcon = drawTreeIcon(d,rc,node);
	r = rc.move(rcIcon.rt()).width(16); 
	switch( node[depth]) {
	case 0:
		d.icon( r.center(14,14), node[icon] );
		d.text( rc.move(r.rt()), node[value] );
	case 1:
		d.icon( r.center(14,14), 'vicon.folder_database' );
		if( node[icon] ) {
			d.icon( rc.move('end',32).center(14,14), node[icon] );
		}
		d.text( rc.move(r.rt()), node[value] );
	default:
		if( node[icon] ) {
			d.icon( r.center(14,14), node[icon] );
		} else {
			d.icon( r.center(14,14), 'vicon.database_table' );
		}
		d.text( rc.move(r.rt()), node[value] );
	}
}

reloadTree(root) {
	not( root ) root = this[tree].current();
	this.search(root);
	root.removeAll();
	this[tree].update();
}

tree.onContextMenu() {
	cur=@me.at(@pos); 
	this[contextNode] = cur;
	@me.menu('actionAddCode, actionReload, -, actionDeleteCode', @pos.incrY(16) );
}

tree.onChange() { 
	this.search( @node );
} 
 
grid.onDraw() {
	this.drawGrid(@draw, @node );
}

drawGrid(d, node) {
	grid = this[grid];
	rc=d.rect();
	modify = drawGridModify(d,node,rc);
	not( modify ) {
		if( d.state(STYLE.Selected) ) {	
			d.fill( rc, '#f0f0f0' );
		} else {
			d.fill();
		}
	}
	field=grid.field(d.index());
	switch( field ) {
	case check:		
		if( node[checked] ) 
			d.icon(rc.center(16.16), Icon.func.check);
		else
			d.icon(rc.center(16.16), Icon.func.add);
	case icon:
		d.icon( rc.center(16,16), node[$field]);		
	case sort:
		d.text( rc.incrX(2), node[$field], 'center' );
 	case ref5:
		val = cc.ccVal('menu_kind', node[$field]);
		if( val ) d.text( rc.incrX(2), val);
	case use_yn:
		d.text( rc, class('code').useYnVal(node[$field]), 'center' );
	default:
		d.text( rc.incrX(2), node[$field] );	
	} 
	d.rectLine(rc,4,'#d0d0d0');
	if( modify ) this[apply].show();
}
evalueCheck.onClick() {
	if( @me.is() ) {
		this[grid].headerSize('evalue',220);
	} else {
		this[grid].headerSize('evalue',2);
	}
}
useYn.onChange() {
	this.search();
} 
addRow.onClick() {
	this.addCode();
} 
apply.onClick() {
	root = this[grid].rootNode();
	pcode = root[code];
	depth = root[depth] + 1;
	while( cur, root ) {
		not( cur[value] ) 
			continue;
		if( cur.state(NODE.add) ) {
			cur[pcode] = pcode;
			cur[depth] = depth;
			sql = template() {
				INSERT into comm_tree (
					code, pcode, value,  evalue, note, depth, icon, url, ref, ref1, ref2, ref3, ref5, sort, use_yn 
				) VALUES (
					#{code},  #{pcode}, #{value},  #{evalue}, #{note}, #{depth}, #{icon}, #{url}, '$ref', #{ref1}, #{ref2}, #{ref3}, #{ref5}, #{sort}, 'Y'
				)
			};
			db.exec(sql,cur); 
		} else if( cur.state(NODE.modify) ) {
			sql = template() {
				UPDATE comm_tree set  
					value=#{value},  evalue=#{evalue}, note=#{note}, icon=#{icon}, url=#{url}, ref1=#{ref1}, ref2=#{ref2}, ref3=#{ref3}, ref5=#{ref5}, sort=#{sort}, use_yn=#{use_yn}, mod_dt=now()
				WHERE ref='$ref' and code=#{code}
			};
			db.exec(sql,cur);
		}	
	}
	this.reloadTree();
}


delete.onClick() {
	not( this.confirm("선택된 메뉴를 삭제하시겠습니까?") ) return;
	_delete = callback( root, flag ) {
		while( sub, root ) {
			if( sub[checked] || flag ) {
				db.exec("delete from comm_tree where ref='$ref' and code=#{code}", sub);
				_delete(sub, true);
			}			
		}
	}	
	_delete( this[grid].rootNode() );
 	this.reloadTree();
} 

gridPopupOk(popup) {
	cf = popup.config();
	checkNode = null;
	while( cur, popup.rootNode() ) {
		if( cur[checked] ) {
			checkNode = cur;
			break;
		}
	}
	not( checkNode ) {
		this.alert("선택된 아이콘이 없습니다");
		return;
	}
	node = cf[record];
	node[icon] = checkNode[icon];
	node.state(NODE.modify, true);
	this[grid].update();
}

grid.onClicked() {
	switch( @column ) {
	case 0: 
		gridCheck(@me, @node, this[delete]);
	case 1:
		not( popup ) {
			cf = {title:"아이콘 선택",fields:"check:*#45, icon:아이콘#55, type:그룹#90, id:아이디#180"};
			popup = this.widget( ginfo('gridPopup') );
			get('global.icons').fetchAll("select type, id  from icons where type='vicon'", cf);
			while( cur, cf ) cur[icon] = "${cur[type]}.${cur[id]}"; 
			popup.initPage(this, cf);
		}
		rc = @me.nodeRect(@node, @column);
		pt = @me.mapGlobal(rc.lb());
		rcOpen = Class.rect(pt, 420,380 );
		popup.config('record', @node);
		openPopup(popup,null,rcOpen);
	default:
		if( @column.eq(10) ) return;	
		@me.edit(@node,@column); 
	}
}

gridInput( index) {
	input  = {
		tag: input, 
		onKeyDown() {
			not( @key.eq( KEY.Enter, KEY.Return) ) return; 
			this[mainWindow].nextFocus(this, @mode&KEY.ctrl);
		}
		init( main, index) {
			this[mainWindow] = main;
			this[index] = index;
		}
	}
	input.init( this, index);
	return input;
}

nextFocus(input, ctrl) {
	node = this[grid].current();
	if( ctrl ) {
		next = this[grid].nextNode(node);
		if( next ) {
			this[grid].current(next);
			this.delay( callback() {
				this[grid].edit(next,2);
			});	
		} else {
			this.delay( callback() {
				this.addCode();
			});
		}
	} else {
		index = input[index] + 1;
		if( index.eq(4,6) ) index++;
		if( index>8 ) return;
		this.delay( callback() {
			this[grid].edit(node,index);
			this[grid].scroll(node,index);
		});	
	}
}

grid.onEditEvent(type, node, data, index) {
	&pos = @me.offset(); 
	&hh = @me.headerHeight();
	switch(type) {
	case create:
		this[editState] = true;
		@me.check('sortEnable',false);
		field=@me.field(index); 
		combo = null;
		switch( field ) {
 		case use_yn:		combo = codeCombo(this, 'use_yn', node[$field], index);  
		case ref5:			combo = codeCombo(this, 'menu_kind', node[$field], index);
		default:				return this.gridInput(index);
		}
		if( combo ) {
			this.delay(callback(){
				combo.showPopup();
			});
			return combo;
		}
	case geometry: 
		field=@me.field(index);  
		if( field.eq('use_yn', 'ref5') ) {
			x = pos.x();
			y = pos.y() + hh;
			return data.move( x, y, true );
		}
	case finish:
		field=@me.field(index);  
		not( node[$field].eq(data) ) {
			not( node.state(NODE.add) ) {
				node.state(NODE.modify, true);
			}
			node[$field] = data;
			if( field.eq('ref5') ) {
				node[ref1] = data;
			}
		}
		@me.update();
		@me.check('sortEnable',true);
	default: return;
	}
}

 
addCode() {
	root = this[grid].rootNode();
	not( this[maxCode] ) {
		depth = root[depth]+1;
		print("depth = $depth");
		code = maxCommCodeValue(db,ref,depth);
	} else {
		code = incrMaxCode(this[maxCode]);
	}
	this[maxCode]=code;
	cur= root.addNode({code: $code, useyn:Y});
	gridAddRow(this[grid], cur, 2);
}
 
	
loadMenu() {
	parse = callback( &str ) {
		idx=0, sp=0, arr=[];
		sql = template() {
			INSERT into comm_tree (
				code, pcode, value, depth, ref, useyn 
			) VALUES (
				#{code},  #{pcode}, #{value},  #{depth}, '$ref', 'Y'
			)
		};
		root = {value: 메뉴관리, icon: vicon.asterisk_orange, code: 'ROOT', depth: 0  };
		arr.add(root);
		while( str.valid() ) {
			left = str.findPos("\\n");
			tabCount = left.count("\\t");
			ch = left.ch();
			not( ch ) continue;
			if( idx.eq(0) ) {
				sp = tabCount;
			}
			n = tabCount-sp;
			if( n<0 ) n=0;
			parent = arr[$n];
			not( parent ) {
				print("$left => $n not parent node");
				return;
			}
			depth = n + 1;
			node = parent.addNode();
			node[value] = left.trim();
			node[depth] = depth;
			node[pcode] = parent[code];
			node[code] = this.maxCommCode(depth);
			db.exec(sql, node);
			print("node=====>$node");
			setArray(arr, depth, node);
			idx++;
		}
		root.delete();
		arr.delete();
	}
	str = instance('eps.file').readAll('data/sample/menu.txt');
	parse( str.ref() );	
}

auth.onClick() {
	while( cur, this[grid].rootNode() ) {
		not( cur.state(NODE.modify) ) continue;
		db.exec("delete from partic_menu_auth where menu_cd=#{code}", cur);
		if( cur[ref3] ) {
			s=cur[ref3].ref();
			while( s.valid() ) {
				cur[auth]=s.findPos(',').trim();
				db.exec("insert into partic_menu_auth (  menu_cd, auth_cd) values (  #{code}, #{auth})",cur);
			}
		}
	}
}


